import type { WorkspaceAction } from '@/shared/actions/action-types';

export type ActionIntent = 'dev' | 'test' | 'build' | 'lint' | 'format' | 'preview' | 'unknown';

export interface ActionUsageSignal {
  readonly actionId: string;
  readonly frequency: number;
  readonly lastUsedAt: number | null;
  readonly successCount: number;
  readonly failureCount: number;
  readonly averageDurationMs: number | null;
}

export interface ActionContextSignal {
  readonly currentCwd: string;
  readonly currentPackageId: string | null;
  readonly currentQuery: string;
  readonly now: number;
}

export interface RankedWorkspaceAction {
  readonly action: WorkspaceAction;
  readonly score: number;
  readonly intent: ActionIntent;
  readonly reasons: readonly string[];
  readonly usage: ActionUsageSignal;
}

export interface ActionSuggestion {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actionId: string;
  readonly score: number;
  readonly reasons: readonly string[];
}

export interface ActionIntelligenceSnapshot {
  readonly rankedActions: readonly RankedWorkspaceAction[];
  readonly suggestions: readonly ActionSuggestion[];
}
