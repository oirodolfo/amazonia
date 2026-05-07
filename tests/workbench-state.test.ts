import { describe, expect, it } from 'vitest';
import { createEmptyWorkbenchState, workbenchReducer } from '../src/renderer/workbench/workbench-state';
import { emptyWorkbenchStoreSnapshot } from '../src/shared/persistence/workbench-store';

describe('workbenchReducer', () => {
  it('loads action groups and flattens actions', () => {
    const state = createEmptyWorkbenchState(emptyWorkbenchStoreSnapshot);
    const next = workbenchReducer(state, {
      type: 'actions.loaded',
      groups: [{
        packageId: 'pkg',
        packageName: '@pkg/demo',
        packagePath: '.',
        detectedTools: ['package-json'],
        actions: [{
          id: 'action',
          packageId: 'pkg',
          packageName: '@pkg/demo',
          label: 'dev',
          command: 'pnpm dev',
          cwd: '/repo',
          kind: 'script',
          weight: 1,
        }],
      }],
    });

    expect(next.actions).toHaveLength(1);
  });
});
