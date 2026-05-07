import { describe, expect, it } from 'vitest';
import { createTerminalCommandPlan } from '../src/terminal';
import type { WorkspaceAction } from '../src/shared';

const action: WorkspaceAction = {
  id: 'pkg:test',
  packageId: 'pkg',
  packageName: '@curupira-labs/amazonia',
  label: 'test',
  command: 'pnpm test',
  cwd: '/repo',
  kind: 'script',
  weight: 90,
};

describe('terminal command plan', () => {
  it('keeps command and cwd untouched', () => {
    const plan = createTerminalCommandPlan(action, '2026-05-04T18:00:00.000Z');
    expect(plan.command).toBe('pnpm test');
    expect(plan.cwd).toBe('/repo');
  });

  it('uses stable terminal defaults', () => {
    const plan = createTerminalCommandPlan(action, '2026-05-04T18:00:00.000Z');
    expect(plan.cols).toBe(120);
    expect(plan.rows).toBe(32);
  });
});
