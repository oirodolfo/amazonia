import { describe, expect, it } from 'vitest';
import { createActionRunPlan, finishRun } from '@/runs';
import type { WorkspaceAction } from '@/shared';

const action: WorkspaceAction = {
  id: 'pkg:test',
  packageId: 'pkg',
  packageName: '@fixture/pkg',
  label: 'test',
  command: 'pnpm --filter @fixture/pkg test',
  cwd: '/repo/packages/pkg',
  kind: 'script',
  weight: 90,
};

describe('action runner', () => {
  it('creates a typed run plan', () => {
    const plan = createActionRunPlan(action, () => new Date('2026-01-01T00:00:00.000Z'));
    expect(plan.run.status).toBe('running');
    expect(plan.tabTitle).toContain('@fixture/pkg');
  });

  it('finalizes successful and failed runs', () => {
    const plan = createActionRunPlan(action, () => new Date('2026-01-01T00:00:00.000Z'));
    expect(finishRun(plan.run, 0, new Date('2026-01-01T00:00:02.000Z')).status).toBe('success');
    expect(finishRun(plan.run, 1, new Date('2026-01-01T00:00:02.000Z')).status).toBe('failed');
  });
});
