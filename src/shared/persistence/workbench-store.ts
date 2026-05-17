import type {PersistedWorkbenchState} from '@/shared/persistence/persistence-types';

/**
 * Renderer-local usage snapshot (subset of persisted layout state used by action ranking).
 */
export interface WorkbenchStoreSnapshot
    extends Pick<PersistedWorkbenchState, 'actionFrequencies' | 'favoriteActionIds' | 'pinnedPackageIds' | 'layout'> {}

export const emptyWorkbenchStoreSnapshot: WorkbenchStoreSnapshot = {
    actionFrequencies: {},
    favoriteActionIds: [],
    pinnedPackageIds: [],
    layout: {},
};

export function incrementActionFrequency(
    store: WorkbenchStoreSnapshot,
    actionId: string,
): WorkbenchStoreSnapshot {
    const current = store.actionFrequencies[actionId] ?? 0;
    return {
        ...store,
        actionFrequencies: {
            ...store.actionFrequencies,
            [actionId]: current + 1,
        },
    };
}
