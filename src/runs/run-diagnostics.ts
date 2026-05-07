import type { FriendlyOutputCard, OutputDiagnostic, RunRecord } from '@/shared/types';

export interface RunHealthSummary {
  readonly runId: string;
  readonly status: RunRecord['status'];
  readonly score: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly linkCount: number;
  readonly durationMs?: number;
  readonly headline: string;
}

const PERFECT_SCORE = 100;
const ERROR_PENALTY = 30;
const WARNING_PENALTY = 8;
const SLOW_RUN_THRESHOLD_MS = 60_000;
const SLOW_RUN_PENALTY = 12;

/**
 * Creates a compact health summary for the friendly output panel and future timeline inspector.
 *
 * @param card - Friendly output card generated from a finished run.
 * @returns A deterministic score and headline for the run.
 *
 * @example
 * ```ts
 * const health = summarizeRunHealth(card);
 * health.score >= 80;
 * ```
 */
export function summarizeRunHealth(card: FriendlyOutputCard): RunHealthSummary {
  const errorCount = countDiagnostics(card.diagnostics, 'error');
  const warningCount = countDiagnostics(card.diagnostics, 'warning');
  const slowPenalty = (card.durationMs ?? 0) > SLOW_RUN_THRESHOLD_MS ? SLOW_RUN_PENALTY : 0;
  const score = clampScore(PERFECT_SCORE - errorCount * ERROR_PENALTY - warningCount * WARNING_PENALTY - slowPenalty);

  return Object.freeze({
    runId: card.runId,
    status: card.status,
    score,
    errorCount,
    warningCount,
    linkCount: card.links.length,
    durationMs: card.durationMs,
    headline: createHeadline(card.status, errorCount, warningCount, score),
  });
}

/**
 * Sorts output cards by severity so the user sees the most important runs first.
 *
 * @param cards - Friendly output cards from recent runs.
 * @returns Cards sorted by failures, warnings and recency-preserving input order.
 *
 * @example
 * ```ts
 * const sorted = sortCardsByAttention(cards);
 * sorted[0]?.status;
 * ```
 */
export function sortCardsByAttention(cards: readonly FriendlyOutputCard[]): readonly FriendlyOutputCard[] {
  return [...cards].sort((left, right) => {
    const leftSummary = summarizeRunHealth(left);
    const rightSummary = summarizeRunHealth(right);
    return leftSummary.score - rightSummary.score;
  });
}

function countDiagnostics(diagnostics: readonly OutputDiagnostic[], level: OutputDiagnostic['level']): number {
  return diagnostics.filter((diagnostic) => diagnostic.level === level).length;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(PERFECT_SCORE, Math.round(score)));
}

function createHeadline(status: RunRecord['status'], errorCount: number, warningCount: number, score: number): string {
  if (status === 'failed' || errorCount > 0) return `${errorCount} error${errorCount === 1 ? '' : 's'} need attention`;
  if (warningCount > 0) return `${warningCount} warning${warningCount === 1 ? '' : 's'} found`;
  if (score < 90) return 'Run completed with performance notes';
  return 'Run completed cleanly';
}
