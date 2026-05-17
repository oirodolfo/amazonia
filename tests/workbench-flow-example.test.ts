import { describe, expect, it } from 'vitest';
import { createWorkbenchFlowExample } from '../src/shared/examples/workbench-flow-example';
import type { WorkspaceAction } from '../src/shared/actions/action-types';

const action: WorkspaceAction = {
  id: 'dev',
  packageId: 'pkg',
  packageName: '@curupira-labs/demo',
  label: 'dev',
  command: 'pnpm dev',
  cwd: '/repo',
  kind: 'script',
  weight: 0,
};

describe('workbench flow example', () => {
  it('creates a concrete action-to-terminal example', () => {
    const example = createWorkbenchFlowExample(action);

    expect(example.plan.command).toBe('pnpm dev');
    expect(example.metric.durationMs).toBe(18);
  });
});
