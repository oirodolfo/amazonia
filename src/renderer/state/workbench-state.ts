import type {FriendlyOutputCard, TerminalTab, WorkspaceManifest} from '@/shared/types';

export interface WorkbenchStateSnapshot {
    readonly workspace: WorkspaceManifest | null;
    readonly tabs: readonly TerminalTab[];
    readonly activeTabId: string | null;
    readonly cards: readonly FriendlyOutputCard[];
}

export interface WorkbenchStatePatch {
    readonly workspace?: WorkspaceManifest | null;
    readonly tabs?: readonly TerminalTab[];
    readonly activeTabId?: string | null;
    readonly cards?: readonly FriendlyOutputCard[];
}

/**
 * Applies a small immutable patch to workbench UI state.
 *
 * @remarks
 * Keeping this as a pure helper makes future Zustand/Jotai/Redux migration optional instead of mandatory. It also lets
 * tests cover tab/card state transitions without rendering React.
 *
 * @param current - Current workbench state snapshot.
 * @param patch - Partial state update.
 * @returns A new state snapshot.
 *
 * @example
 * ```ts
 * reduceWorkbenchState(emptyWorkbenchState, { activeTabId: 'tab-1' }).activeTabId;
 * // => 'tab-1'
 * ```
 */
export function reduceWorkbenchState(current: WorkbenchStateSnapshot, patch: WorkbenchStatePatch): WorkbenchStateSnapshot {
    return Object.freeze({
        workspace: patch.workspace === undefined ? current.workspace : patch.workspace,
        tabs: patch.tabs ?? current.tabs,
        activeTabId: patch.activeTabId === undefined ? current.activeTabId : patch.activeTabId,
        cards: patch.cards ?? current.cards,
    });
}

export const emptyWorkbenchState: WorkbenchStateSnapshot = Object.freeze({
    workspace: null,
    tabs: [],
    activeTabId: null,
    cards: []
});
