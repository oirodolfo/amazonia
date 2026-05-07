import { describe, expect, it } from 'vitest';
import { createWorkbenchFlowExample } from '../src/shared/examples/workbench-flow-example';
import type { WorkspaceAction } from '../src/shared/actions/action-types';

const action: WorkspaceAction = {
  id: 'dev',
  packageId: 'pkg',
  packageName: '@curupira-labs/demo',
  packagePath: '.',
  name: 'dev',
  command: 'pnpm dev',
  cwd: '/repo',
  kind: 'script',
  tool: 'package-json',
  frequency: 0,
  isFavorite: false,
  searchText: 'dev pnpm dev',
};

describe('workbench flow example', () => {
  it('creates a concrete action-to-terminal example', () => {
    const example = createWorkbenchFlowExample(action);

    expect(example.plan.command).toBe('pnpm dev');
    expect(example.metric.durationMs).toBe(18);
  });
});
