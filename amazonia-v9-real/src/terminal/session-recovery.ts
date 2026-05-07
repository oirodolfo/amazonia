import type { TerminalTab } from '@/shared/types';
import type { TerminalOrchestrator, TerminalSessionSnapshot } from './orchestrator';

export interface RecoveredTerminalSession {
  readonly snapshot: TerminalSessionSnapshot;
  readonly shouldRespawn: boolean;
}

/**
 * Restores terminal tabs into the orchestrator after a renderer reload or application restart.
 *
 * @remarks
 * A native process cannot be resurrected after the app exits, so running tabs are restored as suspended shells.
 * The UI can then offer a one-click restart without lying about the original PTY still being alive.
 *
 * @param orchestrator - Terminal registry that owns immutable session snapshots.
 * @param tabs - Persisted terminal tab records from SQLite or memory fallback.
 * @returns Recovered snapshots and whether each session should be respawned by the host.
 *
 * @example
 * ```ts
 * const recovered = recoverTerminalSessions(orchestrator, tabs);
 * recovered.filter((session) => session.shouldRespawn);
 * ```
 */
export function recoverTerminalSessions(orchestrator: TerminalOrchestrator, tabs: readonly TerminalTab[]): readonly RecoveredTerminalSession[] {
  return tabs.map((tab) => {
    const wasRunning = tab.status === 'running';
    const snapshot = orchestrator.create({
      id: tab.id,
      title: tab.title,
      cwd: tab.cwd,
      command: tab.command,
      createdAtIso: tab.createdAtIso,
      status: wasRunning ? 'suspended' : tab.status,
    });

    return Object.freeze({ snapshot, shouldRespawn: wasRunning });
  });
}
