import { describe, expect, it } from 'vitest';
import { createActionIntelligenceSnapshot, inferActionIntent, rankWorkspaceAction } from '../src/shared/intelligence/action-intelligence';
import type { WorkspaceAction } from '../src/shared/actions/action-types';

function action(input: Partial<WorkspaceAction>): WorkspaceAction {
  return {
    id: input.id ?? 'a',
    packageId: input.packageId ?? 'pkg',
    packageName: input.packageName ?? '@pkg/demo',
    packagePath: input.packagePath ?? '.',
    name: input.name ?? 'dev',
    command: input.command ?? 'pnpm dev',
    cwd: input.cwd ?? '/repo',
    kind: input.kind ?? 'script',
    tool: input.tool ?? 'package-json',
    frequency: input.frequency ?? 0,
    isFavorite: input.isFavorite ?? false,
    searchText: input.searchText ?? `${input.name ?? 'dev'} ${input.command ?? 'pnpm dev'} @pkg/demo`,
  };
}

describe('action intelligence', () => {
  it('infers action intent', () => {
    expect(inferActionIntent(action({ name: 'test', command: 'vitest run' }))).toBe('test');
    expect(inferActionIntent(action({ name: 'build', command: 'vite build' }))).toBe('build');
  });

  it('ranks actions by frequency and recency', () => {
    const now = 1000 * 60 * 60 * 24 * 10;
    const ranked = rankWorkspaceAction(
      action({ id: 'dev', name: 'dev' }),
      { actionId: 'dev', frequency: 10, lastUsedAt: now - 1000, successCount: 5, failureCount: 0, averageDurationMs: null },
      { currentCwd: '/repo', currentPackageId: null, currentQuery: '', now },
    );

    expect(ranked.score).toBeGreaterThan(0);
    expect(ranked.reasons).toContain('recently used');
  });

  it('creates suggestions from ranked actions', () => {
    const snapshot = createActionIntelligenceSnapshot(
      [action({ id: 'dev', name: 'dev' })],
      { dev: { actionId: 'dev', frequency: 5, lastUsedAt: 99, successCount: 3, failureCount: 0, averageDurationMs: null } },
      { currentCwd: '/repo', currentPackageId: null, currentQuery: 'dev', now: 100 },
    );

    expect(snapshot.suggestions).toHaveLength(1);
    expect(snapshot.suggestions[0]?.actionId).toBe('dev');
  });
});
