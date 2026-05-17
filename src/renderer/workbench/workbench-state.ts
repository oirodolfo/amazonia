import type {WorkspaceAction, WorkspaceActionGroup} from '@/shared/action-types';
import type {WorkbenchStoreSnapshot} from '@/shared/persistence/workbench-store';
import type {TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';
import {
    emptyTerminalTabsState,
    terminalTabsReducer,
    type TerminalTabsState,
} from '@/renderer/terminal/terminal-tabs-state';
import {
    defaultSidebarState,
    type SidebarEvent,
    sidebarReducer,
    type SidebarState,
} from '@/renderer/workbench/sidebar/sidebar-state';

export interface OutputSummaryIssue {
    readonly severity: 'error' | 'warning';
    readonly message: string;
    readonly file?: string;
    readonly line?: number;
    readonly column?: number;
}

export interface OutputSummaryLink {
    readonly value: string;
    readonly line?: number;
}

export interface ParsedOutputSummary {
    readonly errors: number;
    readonly warnings: number;
    readonly issues: readonly OutputSummaryIssue[];
    readonly links: readonly OutputSummaryLink[];
}

export interface FriendlyOutputCard {
    readonly id: string;
    readonly sessionId: string;
    readonly title: string;
    readonly summary: ParsedOutputSummary;
    readonly createdAt: number;
}

export interface WorkbenchState {
    readonly actions: readonly WorkspaceAction[];
    readonly actionGroups: readonly WorkspaceActionGroup[];
    readonly sidebar: SidebarState;
    readonly terminalTabs: TerminalTabsState;
    readonly outputCards: readonly FriendlyOutputCard[];
    readonly store: WorkbenchStoreSnapshot;
}

export type WorkbenchEvent =
    | {readonly type: 'sidebar.event'; readonly event: SidebarEvent}
    | {readonly type: 'terminal.session.upserted'; readonly session: TerminalSessionSnapshot}
    | {readonly type: 'terminal.session.closed'; readonly sessionId: string}
    | {readonly type: 'terminal.session.activeChanged'; readonly sessionId: string | null}
    | {readonly type: 'output.card.added'; readonly card: FriendlyOutputCard}
    | {readonly type: 'store.updated'; readonly store: WorkbenchStoreSnapshot}
    | {readonly type: 'actions.loaded'; readonly groups: readonly WorkspaceActionGroup[]};

export const createEmptyWorkbenchState = (store: WorkbenchStoreSnapshot): WorkbenchState => ({
    actions: [],
    actionGroups: [],
    sidebar: defaultSidebarState,
    terminalTabs: emptyTerminalTabsState,
    outputCards: [],
    store,
});

export function workbenchReducer(state: WorkbenchState, event: WorkbenchEvent): WorkbenchState {
    switch (event.type) {
        case 'sidebar.event':
            return {...state, sidebar: sidebarReducer(state.sidebar, event.event)};
        case 'terminal.session.upserted':
            return {
                ...state,
                terminalTabs: terminalTabsReducer(state.terminalTabs, {
                    type: 'session.upserted',
                    session: event.session,
                }),
            };
        case 'terminal.session.closed':
            return {
                ...state,
                terminalTabs: terminalTabsReducer(state.terminalTabs, {
                    type: 'session.closed',
                    sessionId: event.sessionId,
                }),
            };
        case 'terminal.session.activeChanged':
            return {
                ...state,
                terminalTabs: terminalTabsReducer(state.terminalTabs, {
                    type: 'session.activeChanged',
                    sessionId: event.sessionId,
                }),
            };
        case 'output.card.added':
            return {...state, outputCards: [event.card, ...state.outputCards].slice(0, 50)};
        case 'store.updated':
            return {...state, store: event.store};
        case 'actions.loaded':
            return {...state, actionGroups: event.groups, actions: event.groups.flatMap((group) => group.actions)};
        default:
            return state;
    }
}

export function findWorkbenchAction(state: WorkbenchState, actionId: string): WorkspaceAction | null {
    return state.actions.find((action) => action.id === actionId) ?? null;
}
