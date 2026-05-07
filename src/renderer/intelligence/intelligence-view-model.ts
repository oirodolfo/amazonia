import type { WorkspaceAction } from '@/shared/actions/action-types';
import type { WorkbenchStoreSnapshot } from '@/shared/persistence/workbench-store';
import {
  createActionIntelligenceSnapshot,
} from '@/shared/intelligence/action-intelligence';
import type {
  ActionContextSignal,
  ActionIntelligenceSnapshot,
  ActionUsageSignal,
} from '@/shared/intelligence/action-intelligence-types';

export interface CreateIntelligenceViewModelInput {
  readonly actions: readonly WorkspaceAction[];
  readonly store: WorkbenchStoreSnapshot;
  readonly currentCwd: string;
  readonly currentPackageId: string | null;
  readonly query: string;
  readonly now?: number;
}

/**
 * Creates the renderer intelligence model from store + current UI context.
 *
 * @param input - Actions, persisted store and current UI context.
 * @returns Ranked action intelligence snapshot.
 *
 * @example
 * ```ts
 * const model = createIntelligenceViewModel({ actions, store, currentCwd, currentPackageId: null, query })
 * ```
 */
export function createIntelligenceViewModel(
  input: CreateIntelligenceViewModelInput,
): ActionIntelligenceSnapshot {
  const usage = createUsageSignals(input.actions, input.store);
  const context: ActionContextSignal = {
    currentCwd: input.currentCwd,
    currentPackageId: input.currentPackageId,
    currentQuery: input.query,
    now: input.now ?? Date.now(),
  };

  return createActionIntelligenceSnapshot(input.actions, usage, context);
}

/**
 * Converts the current persisted store into richer usage signals.
 *
 * @param actions - Actions that may have stored frequency.
 * @param store - Persisted workbench store.
 * @returns Usage signals keyed by action id.
 *
 * @example
 * ```ts
 * createUsageSignals(actions, store)
 * ```
 */
export function createUsageSignals(
  actions: readonly WorkspaceAction[],
  store: WorkbenchStoreSnapshot,
): Readonly<Record<string, ActionUsageSignal>> {
  return Object.fromEntries(
    actions.map((action) => [
      action.id,
      {
        actionId: action.id,
        frequency: store.actionFrequencies[action.id] ?? action.frequency ?? 0,
        lastUsedAt: extractLastUsedAt(store.layout, action.id),
        successCount: extractCount(store.layout, `success:${action.id}`),
        failureCount: extractCount(store.layout, `failure:${action.id}`),
        averageDurationMs: null,
      } satisfies ActionUsageSignal,
    ]),
  );
}

function extractLastUsedAt(layout: Readonly<Record<string, unknown>>, actionId: string): number | null {
  const value = layout[`lastUsedAt:${actionId}`];
  return typeof value === 'number' ? value : null;
}

function extractCount(layout: Readonly<Record<string, unknown>>, key: string): number {
  const value = layout[key];
  return typeof value === 'number' ? value : 0;
}
