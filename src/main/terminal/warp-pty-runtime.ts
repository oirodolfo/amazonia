import os from 'node:os';
import type { RuntimeEventBus } from '@/shared/runtime/runtime-event-bus';
import type { TerminalDataFrame, TerminalSessionSnapshot, TerminalSize, WorkbenchRuntime } from '@/shared/runtime/runtime-types';
import { createTerminalSessionSnapshot, updateTerminalSession } from '@/shared/runtime/runtime-types';

export interface WarpPtyProcess {
  readonly pid: number;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
  onData(listener: (data: string) => void): void;
  onExit(listener: (event: { readonly exitCode: number; readonly signal?: number }) => void): void;
}

export interface WarpPtyModule {
  spawn(shell: string, args: readonly string[], options: {
    readonly name: string;
    readonly cwd: string;
    readonly env: NodeJS.ProcessEnv;
    readonly cols: number;
    readonly rows: number;
  }): WarpPtyProcess;
}

export interface WarpPtyRuntimeEvents {
  readonly onData: (frame: TerminalDataFrame) => void;
  readonly onStatus: (snapshot: TerminalSessionSnapshot) => void;
  readonly onExit: (snapshot: TerminalSessionSnapshot) => void;
}

interface WarpPtySession {
  snapshot: TerminalSessionSnapshot;
  process: WarpPtyProcess;
  commandHistory: string[];
}

/**
 * Production PTY runtime used by the Warp-like terminal.
 */
export class WarpPtyRuntime {
  private readonly sessions = new Map<string, WarpPtySession>();

  public constructor(
    private readonly pty: WarpPtyModule,
    private readonly events: WarpPtyRuntimeEvents,
    private readonly bus?: RuntimeEventBus,
  ) {}

  /**
   * Opens an interactive PTY session.
   *
   * @param input - Session input.
   * @returns Terminal session snapshot.
   *
   * @example
   * ```ts
   * runtime.open({ title: 'shell', cwd: process.cwd(), runtime: 'electron' })
   * ```
   */
  public open(input: {
    readonly title: string;
    readonly cwd: string;
    readonly runtime: WorkbenchRuntime;
    readonly size?: TerminalSize;
    readonly command?: string | null;
  }): TerminalSessionSnapshot {
    const created = createTerminalSessionSnapshot({
      title: input.title,
      cwd: input.cwd,
      runtime: input.runtime,
      command: input.command ?? null,
      size: input.size,
    });

    const shell = resolveWarpShell();
    const processHandle = this.pty.spawn(shell.command, shell.args, {
      name: 'xterm-256color',
      cwd: input.cwd,
      env: process.env,
      cols: created.size.cols,
      rows: created.size.rows,
    });

    const snapshot = updateTerminalSession(created, { status: 'running' });

    this.sessions.set(snapshot.id, { snapshot, process: processHandle, commandHistory: [] });
    this.attach(snapshot.id, processHandle);
    this.events.onStatus(snapshot);
    this.bus?.publish({
      id: `pty:opened:${snapshot.id}`,
      type: 'pty.session.opened',
      createdAt: Date.now(),
      payload: { sessionId: snapshot.id, cwd: snapshot.cwd },
    });

    if (input.command) this.runCommand(snapshot.id, input.command);

    return snapshot;
  }

  /**
   * Runs a command in an existing session.
   *
   * @param sessionId - Session id.
   * @param command - Command to run.
   * @returns Whether the command was delivered.
   */
  public runCommand(sessionId: string, command: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.commandHistory.push(command);
    session.process.write(`${command}${os.EOL}`);
    this.bus?.publish({
      id: `pty:command:${sessionId}:${Date.now()}`,
      type: 'pty.command.started',
      createdAt: Date.now(),
      payload: { sessionId, command, cwd: session.snapshot.cwd },
    });
    return true;
  }

  public write(sessionId: string, data: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.process.write(data);
    return true;
  }

  public resize(sessionId: string, size: TerminalSize): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.process.resize(size.cols, size.rows);
    session.snapshot = updateTerminalSession(session.snapshot, { size });
    this.events.onStatus(session.snapshot);
    return true;
  }

  public kill(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.process.kill();
    session.snapshot = updateTerminalSession(session.snapshot, { status: 'killed' });
    this.events.onStatus(session.snapshot);
    this.sessions.delete(sessionId);
    return true;
  }

  public list(): TerminalSessionSnapshot[] {
    return [...this.sessions.values()].map((session) => session.snapshot);
  }

  private attach(sessionId: string, processHandle: WarpPtyProcess): void {
    processHandle.onData((data) => {
      const frame = { sessionId, data, receivedAt: Date.now() };
      this.events.onData(frame);
      this.bus?.publish({
        id: `pty:data:${sessionId}:${frame.receivedAt}`,
        type: 'pty.data',
        createdAt: frame.receivedAt,
        payload: frame,
      });
    });

    processHandle.onExit((event) => {
      const session = this.sessions.get(sessionId);
      if (!session) return;

      session.snapshot = updateTerminalSession(session.snapshot, {
        status: 'exited',
        exitCode: event.exitCode,
      });
      this.events.onExit(session.snapshot);
      this.sessions.delete(sessionId);
    });
  }
}

/**
 * Resolves the default shell for Warp-like sessions.
 *
 * @returns Shell command and args.
 */
export function resolveWarpShell(): { readonly command: string; readonly args: readonly string[] } {
  return process.platform === 'win32'
    ? { command: process.env.COMSPEC ?? 'powershell.exe', args: [] }
    : { command: process.env.SHELL ?? 'bash', args: [] };
}
