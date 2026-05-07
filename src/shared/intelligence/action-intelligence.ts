import type { WorkspaceAction } from '@/shared/actions/action-types';
import type {
  ActionContextSignal,
  ActionIntent,
  ActionIntelligenceSnapshot,
  ActionSuggestion,
  ActionUsageSignal,
  RankedWorkspaceAction,
} from './action-intelligence-types';

const RECENCY_HALF_LIFE_MS = 1000 * 60 * 60 * 24 * 7;
const FREQUENCY_WEIGHT = 18;
const RECENCY_WEIGHT = 22;
const CONTEXT_WEIGHT = 24;
const QUERY_WEIGHT = 28;
const SUCCESS_WEIGHT = 8;
const FAILURE_PENALTY = 6;

/**
 * Builds a full intelligence snapshot for sidebar and command palette ordering.
 *
 * @param actions - Workspace actions to rank.
 * @param usageSignals - Usage signals keyed by action id.
 * @param context - Current user/workspace context.
 * @returns Ranked actions and suggestions.
 *
 * @example
 * ```ts
 * const snapshot = createActionIntelligenceSnapshot(actions, usage, context)
 * snapshot.suggestions[0]?.title
 * ```
 */
export function createActionIntelligenceSnapshot(
  actions: readonly WorkspaceAction[],
  usageSignals: Readonly<Record<string, ActionUsageSignal>>,
  context: ActionContextSignal,
): ActionIntelligenceSnapshot {
  const rankedActions = actions
    .map((action) => rankWorkspaceAction(action, usageSignals[action.id], context))
    .sort((left, right) => right.score - left.score);

  return {
    rankedActions,
    suggestions: createActionSuggestions(rankedActions),
  };
}

/**
 * Ranks a single action using frequency, recency, context and query signals.
 *
 * @param action - Workspace action.
 * @param usageSignal - Optional persisted usage signal.
 * @param context - Current workbench context.
 * @returns Ranked action with reasons.
 *
 * @example
 * ```ts
 * rankWorkspaceAction(action, usage, { currentQuery: 'test', currentCwd: '/repo', currentPackageId: null, now: Date.now() })
 * ```
 */
export function rankWorkspaceAction(
  action: WorkspaceAction,
  usageSignal: ActionUsageSignal | undefined,
  context: ActionContextSignal,
): RankedWorkspaceAction {
  const usage = usageSignal ?? createEmptyUsageSignal(action.id);
  const intent = inferActionIntent(action);
  const reasons: string[] = [];

  const frequencyScore = Math.log1p(usage.frequency) * FREQUENCY_WEIGHT;
  if (usage.frequency > 0) {
    reasons.push(`${usage.frequency} previous run${usage.frequency === 1 ? '' : 's'}`);
  }

  const recencyScore = scoreRecency(usage.lastUsedAt, context.now) * RECENCY_WEIGHT;
  if (usage.lastUsedAt) {
    reasons.push('recently used');
  }

  const contextScore = scoreContext(action, context, reasons) * CONTEXT_WEIGHT;
  const queryScore = scoreQuery(action, context.currentQuery, reasons) * QUERY_WEIGHT;
  const successScore = scoreSuccessRate(usage) * SUCCESS_WEIGHT;
  const failureScore = usage.failureCount * FAILURE_PENALTY;

  const score = Math.max(0, frequencyScore + recencyScore + contextScore + queryScore + successScore - failureScore);

  return {
    action,
    score: Number(score.toFixed(3)),
    intent,
    reasons,
    usage,
  };
}

/**
 * Creates human-friendly suggestions from ranked actions.
 *
 * @param rankedActions - Ranked action list.
 * @param limit - Maximum suggestions.
 * @returns Suggestion cards.
 *
 * @example
 * ```ts
 * createActionSuggestions(rankedActions, 5)
 * ```
 */
export function createActionSuggestions(
  rankedActions: readonly RankedWorkspaceAction[],
  limit = 6,
): ActionSuggestion[] {
  return rankedActions
    .filter((ranked) => ranked.score > 0)
    .slice(0, limit)
    .map((ranked) => ({
      id: `suggestion:${ranked.action.id}`,
      title: ranked.action.name,
      subtitle: `${ranked.action.packageName} · ${ranked.action.tool}`,
      actionId: ranked.action.id,
      score: ranked.score,
      reasons: ranked.reasons.length > 0 ? ranked.reasons : ['good workspace match'],
    }));
}

/**
 * Infers an action intent from name and command.
 *
 * @param action - Workspace action.
 * @returns Inferred action intent.
 *
 * @example
 * ```ts
 * inferActionIntent(action)
 * ```
 */
export function inferActionIntent(action: WorkspaceAction): ActionIntent {
  const haystack = `${action.name} ${action.command}`.toLowerCase();

  if (haystack.includes('test') || haystack.includes('vitest')) return 'test';
  if (haystack.includes('build')) return 'build';
  if (haystack.includes('lint')) return 'lint';
  if (haystack.includes('format') || haystack.includes('prettier')) return 'format';
  if (haystack.includes('preview')) return 'preview';
  if (haystack.includes('dev') || haystack.includes('start')) return 'dev';

  return 'unknown';
}

function orFalse(value: boolean): boolean {
  return value;
}

function createEmptyUsageSignal(actionId: string): ActionUsageSignal {
  return {
    actionId,
    frequency: 0,
    lastUsedAt: null,
    successCount: 0,
    failureCount: 0,
    averageDurationMs: null,
  };
}

function scoreRecency(lastUsedAt: number | null, now: number): number {
  if (!lastUsedAt) {
    return 0;
  }

  const age = Math.max(0, now - lastUsedAt);
  return Math.pow(0.5, age / RECENCY_HALF_LIFE_MS);
}

function scoreContext(action: WorkspaceAction, context: ActionContextSignal, reasons: string[]): number {
  let score = 0;

  if (context.currentPackageId && action.packageId === context.currentPackageId) {
    score += 0.7;
    reasons.push('current package');
  }

  if (context.currentCwd && action.cwd && normalize(action.cwd).startsWith(normalize(context.currentCwd))) {
    score += 0.3;
    reasons.push('current directory');
  }

  return Math.min(1, score);
}

function scoreQuery(action: WorkspaceAction, query: string, reasons: string[]): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return 0;
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const haystack = action.searchText.toLowerCase();
  const matches = tokens.filter((token) => haystack.includes(token)).length;

  if (matches === tokens.length) {
    reasons.push('matches search');
  }

  return matches / Math.max(1, tokens.length);
}

function scoreSuccessRate(usage: ActionUsageSignal): number {
  const total = usage.successCount + usage.failureCount;
  if (total === 0) {
    return 0;
  }

  return usage.successCount / total;
}

function normalize(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+$/, '').toLowerCase();
}
