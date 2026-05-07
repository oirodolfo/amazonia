import type { TerminalTab } from '@/shared/types';

export type TerminalLifecycleStatus = TerminalTab['status'] | 'crashed' | 'suspended';

export interface TerminalSessionSnapshot {
  readonly id: string;
  readonly title: string;
  readonly cwd: string;
  readonly command?: string;
  readonly createdAtIso: string;
  readonly status: TerminalLifecycleStatus;
  readonly lastExitCode?: number;
  readonly lastActivityAtIso: string;
  readonly outputBytes: number;
}

export interface TerminalSessionPatch {
  readonly status?: TerminalLifecycleStatus;
  readonly lastExitCode?: number;
  readonly outputBytesDelta?: number;
  readonly nowIso?: string;
}

/**
 * Coordinates terminal tabs without knowing whether the process lives in Electron IPC or WebSocket mode.
 *
 * @remarks
 * This replaces ad-hoc arrays in UI state with a deterministic session registry. It keeps terminal orchestration
 * testable and lets the renderer restore tabs, mark crashed sessions and keep lightweight activity metrics.
 *
 * @example
 * ```ts
 * const orchestrator = new TerminalOrchestrator();
 * const session = orchestrator.create({ id: 'run-1', title: 'test', cwd: '/repo', command: 'pnpm test' });
 * orchestrator.patch(session.id, { status: 'running', outputBytesDelta: 120 });
 * orchestrator.list()[0].outputBytes;
 * ```
 */
export class TerminalOrchestrator {
  private readonly sessions = new Map<string, TerminalSessionSnapshot>();

  /**
   * Creates or replaces a terminal session snapshot.
   *
   * @param input - Initial terminal session data.
   * @returns The immutable session snapshot stored by the registry.
   *
   * @example
   * ```ts
   * orchestrator.create({ id: 'shell', title: 'Shell', cwd: '/repo' });
   * ```
   */
  public create(input: Pick<TerminalSessionSnapshot, 'id' | 'title' | 'cwd'> & Partial<Pick<TerminalSessionSnapshot, 'command' | 'createdAtIso' | 'status'>>): TerminalSessionSnapshot {
    const nowIso = input.createdAtIso ?? new Date().toISOString();
    const snapshot: TerminalSessionSnapshot = Object.freeze({
      id: input.id,
      title: input.title,
      cwd: input.cwd,
      command: input.command,
      createdAtIso: nowIso,
      status: input.status ?? 'idle',
      lastActivityAtIso: nowIso,
      outputBytes: 0,
    });
    this.sessions.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * Applies a typed patch to a session while preserving immutable snapshots.
   *
   * @param id - Terminal session identifier.
   * @param patch - Small state transition to apply.
   * @returns The updated snapshot, or null when the session does not exist.
   *
   * @example
   * ```ts
   * orchestrator.patch('shell', { status: 'exited', lastExitCode: 0 });
   * ```
   */
  public patch(id: string, patch: TerminalSessionPatch): TerminalSessionSnapshot | null {
    const current = this.sessions.get(id);
    if (current === undefined) return null;
    const next: TerminalSessionSnapshot = Object.freeze({
      ...current,
      status: patch.status ?? current.status,
      lastExitCode: patch.lastExitCode ?? current.lastExitCode,
      lastActivityAtIso: patch.nowIso ?? new Date().toISOString(),
      outputBytes: current.outputBytes + Math.max(0, patch.outputBytesDelta ?? 0),
    });
    this.sessions.set(id, next);
    return next;
  }

  /**
   * Removes a session from the registry.
   *
   * @param id - Terminal session identifier.
   * @returns True when a session was removed.
   *
   * @example
   * ```ts
   * orchestrator.remove('shell');
   * ```
   */
  public remove(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Lists sessions sorted by most recent activity first.
   *
   * @returns Immutable terminal session snapshots.
   *
   * @example
   * ```ts
   * const active = orchestrator.list().filter((session) => session.status === 'running');
   * ```
   */
  public list(): readonly TerminalSessionSnapshot[] {
    return Array.from(this.sessions.values()).sort((left, right) => right.lastActivityAtIso.localeCompare(left.lastActivityAtIso));
  }

  /**
   * Converts snapshots into renderer-friendly terminal tabs.
   *
   * @returns Terminal tabs compatible with the shared UI protocol.
   *
   * @example
   * ```ts
   * const tabs = orchestrator.toTabs();
   * ```
   */
  public toTabs(): readonly TerminalTab[] {
    return this.list().map((session) => ({
      id: session.id,
      title: session.title,
      cwd: session.cwd,
      command: session.command,
      createdAtIso: session.createdAtIso,
      status: session.status === 'crashed' || session.status === 'suspended' ? 'exited' : session.status,
    }));
  }
}
