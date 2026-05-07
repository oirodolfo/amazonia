import type {TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';

export interface RestoredTerminalTab {
    readonly session: TerminalSessionSnapshot;
    readonly shouldReconnect: boolean;
}

/**
 * Plans restore behavior for terminal tabs after app reload.
 *
 * @param sessions - Previously persisted sessions.
 * @returns Restore plan for each terminal tab.
 *
 * @example
 * ```ts
 * planTerminalTabRestore(sessions)
 * ```
 */
export function planTerminalTabRestore(sessions: readonly TerminalSessionSnapshot[]): RestoredTerminalTab[] {
    return sessions.map((session) => ({
        session,
        shouldReconnect: session.status === 'running' || session.status === 'connecting',
    }));
}
