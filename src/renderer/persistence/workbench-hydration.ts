import type { PersistedWorkbenchState } from '@/shared/persistence/persistence-types';
import { emptyWorkbenchStoreSnapshot, type WorkbenchStoreSnapshot } from '@/shared/persistence/workbench-store';
import type { TerminalSessionSnapshot } from '@/shared/runtime/runtime-types';

export interface WorkbenchHydrationPlan {
  readonly store: WorkbenchStoreSnapshot;
  readonly terminalSessions: readonly TerminalSessionSnapshot[];
}

/**
 * Converts persisted state into renderer hydration data.
 *
 * @param state - Persisted state from SQLite.
 * @returns Store and terminal sessions ready for the renderer.
 *
 * @example
 * ```ts
 * createWorkbenchHydrationPlan(persisted)
 * ```
 */
export function createWorkbenchHydrationPlan(state: PersistedWorkbenchState): WorkbenchHydrationPlan {
  return {
    store: {
      ...emptyWorkbenchStoreSnapshot,
      actionFrequencies: state.actionFrequencies,
      favoriteActionIds: state.favoriteActionIds,
      pinnedPackageIds: state.pinnedPackageIds,
      layout: state.layout,
    },
    terminalSessions: state.terminalSessions,
  };
}
