import type {TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';

export interface TerminalTabsState {
    readonly activeSessionId: string | null;
    readonly sessions: readonly TerminalSessionSnapshot[];
}

export type TerminalTabsEvent =
    | { readonly type: 'session.upserted'; readonly session: TerminalSessionSnapshot }
    | { readonly type: 'session.closed'; readonly sessionId: string }
    | { readonly type: 'session.activeChanged'; readonly sessionId: string | null };

export const emptyTerminalTabsState: TerminalTabsState = {
    activeSessionId: null,
    sessions: [],
};

/**
 * Reduces terminal tab state.
 *
 * @param state - Current tab state.
 * @param event - Tab event.
 * @returns Updated tab state.
 *
 * @example
 * ```ts
 * terminalTabsReducer(emptyTerminalTabsState, { type: 'session.upserted', session })
 * ```
 */
export function terminalTabsReducer(
    state: TerminalTabsState,
    event: TerminalTabsEvent,
): TerminalTabsState {
    switch (event.type) {
        case 'session.upserted': {
            const exists = state.sessions.some((session) => session.id === event.session.id);
            const sessions = exists
                ? state.sessions.map((session) => session.id === event.session.id ? event.session : session)
                : [...state.sessions, event.session];

            return {
                activeSessionId: state.activeSessionId ?? event.session.id,
                sessions,
            };
        }

        case 'session.closed': {
            const sessions = state.sessions.filter((session) => session.id !== event.sessionId);
            const activeSessionId = state.activeSessionId === event.sessionId
                ? sessions.at(-1)?.id ?? null
                : state.activeSessionId;

            return {
                activeSessionId,
                sessions,
            };
        }

        case 'session.activeChanged':
            return {
                ...state,
                activeSessionId: event.sessionId,
            };
    }
}
