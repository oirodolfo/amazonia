import type { WorkspaceAction } from '@/shared/types';

export interface ActionUsageSignal {
  readonly actionId: string;
  readonly runCount: number;
  readonly lastRunAtIso?: string;
  readonly successCount: number;
  readonly failureCount: number;
}

export interface SuggestedAction {
  readonly action: WorkspaceAction;
  readonly score: number;
  readonly reason: 'frequent' | 'recent' | 'healthy' | 'weighted';
}

/**
 * Ranks workspace actions using frequency, recency, success ratio and scanner weight.
 *
 * @remarks
 * This replaces pure alphabetical action lists with a small local-intelligence layer. It does not call remote
 * services and can safely run in both desktop and web modes.
 *
 * @param actions - Available workspace actions.
 * @param usageSignals - Local usage counters persisted by the workbench.
 * @returns Actions sorted by usefulness for command palette, hover cards and sidebar groups.
 *
 * @example
 * ```ts
 * const suggestions = suggestActions(actions, [{ actionId: actions[0].id, runCount: 3, successCount: 3, failureCount: 0 }]);
 * suggestions[0]?.reason;
 * ```
 */
export function suggestActions(actions: readonly WorkspaceAction[], usageSignals: readonly ActionUsageSignal[]): readonly SuggestedAction[] {
  const usageByAction = new Map(usageSignals.map((signal) => [signal.actionId, signal]));

  return actions
    .map((action) => {
      const signal = usageByAction.get(action.id);
      const score = scoreAction(action, signal);
      return Object.freeze({ action, score, reason: getReason(action, signal) } satisfies SuggestedAction);
    })
    .sort((left, right) => right.score - left.score || left.action.packageName.localeCompare(right.action.packageName) || left.action.label.localeCompare(right.action.label));
}

function scoreAction(action: WorkspaceAction, signal: ActionUsageSignal | undefined): number {
  const runCount = signal?.runCount ?? 0;
  const totalRuns = Math.max(1, (signal?.successCount ?? 0) + (signal?.failureCount ?? 0));
  const successRatio = (signal?.successCount ?? 0) / totalRuns;
  const recencyBoost = signal?.lastRunAtIso === undefined ? 0 : Math.max(0, 24 - hoursSince(signal.lastRunAtIso));
  return action.weight + runCount * 8 + successRatio * 12 + recencyBoost;
}

function getReason(action: WorkspaceAction, signal: ActionUsageSignal | undefined): SuggestedAction['reason'] {
  if ((signal?.runCount ?? 0) > 2) return 'frequent';
  if (signal?.lastRunAtIso !== undefined && hoursSince(signal.lastRunAtIso) < 24) return 'recent';
  if ((signal?.successCount ?? 0) > (signal?.failureCount ?? 0)) return 'healthy';
  return action.weight > 80 ? 'weighted' : 'weighted';
}

function hoursSince(iso: string): number {
  return Math.max(0, (Date.now() - Date.parse(iso)) / 3_600_000);
}
