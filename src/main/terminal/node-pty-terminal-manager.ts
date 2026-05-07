import os from 'node:os';
import type {
    CreateTerminalSessionInput,
    RunActionInput,
    TerminalDataFrame,
    TerminalSessionSnapshot,
    TerminalSize,
} from '@/shared/runtime/runtime-types';
import {createTerminalSessionSnapshot, updateTerminalSession,} from '@/shared/runtime/runtime-types';

export interface PtyLikeProcess {
    readonly pid: number;

    write(data: string): void;

    resize(cols: number, rows: number): void;

    kill(signal?: string): void;

    onData(listener: (data: string) => void): void;

    onExit(listener: (event: { readonly exitCode: number; readonly signal?: number }) => void): void;
}

export interface PtyLikeModule {
    spawn(
        shell: string,
        args: readonly string[],
        options: {
            readonly name: string;
            readonly cwd: string;
            readonly env: NodeJS.ProcessEnv;
            readonly cols: number;
            readonly rows: number;
        },
    ): PtyLikeProcess;
}

export interface TerminalManagerEvents {
    readonly onData: (frame: TerminalDataFrame) => void;
    readonly onStatus: (snapshot: TerminalSessionSnapshot) => void;
    readonly onExit: (snapshot: TerminalSessionSnapshot) => void;
}

interface ManagedSession {
    snapshot: TerminalSessionSnapshot;
    process: PtyLikeProcess;
}

/**
 * Owns real node-pty sessions for the Electron runtime.
 */
export class NodePtyTerminalManager {
    private readonly sessions = new Map<string, ManagedSession>();

    public constructor(
        private readonly pty: PtyLikeModule,
        private readonly events: TerminalManagerEvents,
    ) {
    }

    /**
     * Creates an interactive shell session.
     *
     * @param input - Terminal creation input.
     * @returns Created terminal snapshot.
     *
     * @example
     * ```ts
     * manager.createSession({ title: 'shell', cwd: process.cwd(), runtime: 'electron' })
     * ```
     */
    public createSession(input: CreateTerminalSessionInput): TerminalSessionSnapshot {
        const snapshot = createTerminalSessionSnapshot(input);
        const processHandle = this.spawnProcess(snapshot.cwd, snapshot.size);

        const managed: ManagedSession = {
            snapshot: updateTerminalSession(snapshot, {status: 'running'}),
            process: processHandle,
        };

        this.sessions.set(snapshot.id, managed);
        this.attachProcessEvents(snapshot.id, processHandle);
        this.events.onStatus(managed.snapshot);

        if (input.command) {
            this.write(snapshot.id, `${input.command}${os.EOL}`);
        }

        return managed.snapshot;
    }

    /**
     * Creates a terminal session and runs an action command immediately.
     *
     * @param input - Action execution input.
     * @returns Created terminal snapshot.
     *
     * @example
     * ```ts
     * manager.runAction({ actionId: 'dev', title: 'dev', command: 'pnpm dev', cwd, runtime: 'electron' })
     * ```
     */
    public runAction(input: RunActionInput): TerminalSessionSnapshot {
        return this.createSession({
            title: input.title,
            cwd: input.cwd,
            command: input.command,
            runtime: input.runtime,
            size: input.size,
        });
    }

    /**
     * Writes user input into a terminal session.
     *
     * @param sessionId - Target terminal session id.
     * @param data - Data to write.
     * @returns Whether the write was delivered.
     *
     * @example
     * ```ts
     * manager.write(session.id, 'ls\n')
     * ```
     */
    public write(sessionId: string, data: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }

        session.process.write(data);
        return true;
    }

    /**
     * Resizes a terminal session.
     *
     * @param sessionId - Target terminal session id.
     * @param size - New terminal size.
     * @returns Whether the resize was delivered.
     *
     * @example
     * ```ts
     * manager.resize(session.id, { cols: 140, rows: 40 })
     * ```
     */
    public resize(sessionId: string, size: TerminalSize): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }

        session.process.resize(size.cols, size.rows);
        session.snapshot = updateTerminalSession(session.snapshot, {size});
        this.events.onStatus(session.snapshot);
        return true;
    }

    /**
     * Kills a terminal session.
     *
     * @param sessionId - Target terminal session id.
     * @returns Whether the session existed.
     *
     * @example
     * ```ts
     * manager.kill(session.id)
     * ```
     */
    public kill(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }

        session.process.kill();
        session.snapshot = updateTerminalSession(session.snapshot, {status: 'killed'});
        this.events.onStatus(session.snapshot);
        this.sessions.delete(sessionId);
        return true;
    }

    /**
     * Lists current terminal sessions.
     *
     * @returns Active terminal snapshots.
     *
     * @example
     * ```ts
     * manager.listSessions()
     * ```
     */
    public listSessions(): TerminalSessionSnapshot[] {
        return [...this.sessions.values()].map((session) => session.snapshot);
    }

    private spawnProcess(cwd: string, size: TerminalSize): PtyLikeProcess {
        const shell = resolveDefaultShell();

        return this.pty.spawn(shell.command, shell.args, {
            name: 'xterm-256color',
            cwd,
            env: process.env,
            cols: size.cols,
            rows: size.rows,
        });
    }

    private attachProcessEvents(sessionId: string, processHandle: PtyLikeProcess): void {
        processHandle.onData((data) => {
            this.events.onData({
                sessionId,
                data,
                receivedAt: Date.now(),
            });
        });

        processHandle.onExit((event) => {
            const session = this.sessions.get(sessionId);
            if (!session) {
                return;
            }

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
 * Resolves the default shell for the current platform.
 *
 * @returns Shell command and arguments.
 *
 * @example
 * ```ts
 * resolveDefaultShell().command
 * ```
 */
export function resolveDefaultShell(): { readonly command: string; readonly args: readonly string[] } {
    if (process.platform === 'win32') {
        return {
            command: process.env.COMSPEC ?? 'powershell.exe',
            args: [],
        };
    }

    return {
        command: process.env.SHELL ?? 'bash',
        args: [],
    };
}
