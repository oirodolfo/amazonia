import { describe, expect, it } from 'vitest';
import { createIntelligenceControllerResult } from '../src/renderer/intelligence/intelligence-controller';
import { createEmptyWorkbenchState, workbenchReducer } from '../src/renderer/workbench/workbench-state';
import { emptyWorkbenchStoreSnapshot } from '../src/shared/persistence/workbench-store';

describe('createIntelligenceControllerResult', () => {
  it('returns ranked action ids from workbench state', () => {
    const state = workbenchReducer(createEmptyWorkbenchState({
      ...emptyWorkbenchStoreSnapshot,
      actionFrequencies: { dev: 3 },
    }), {
      type: 'actions.loaded',
      groups: [{
        packageId: 'pkg',
        packageName: '@pkg/demo',
        packagePath: '.',
        detectedTools: ['package-json'],
        actions: [{
          id: 'dev',
          packageId: 'pkg',
          packageName: '@pkg/demo',
          packagePath: '.',
          name: 'dev',
          command: 'pnpm dev',
          cwd: '/repo',
          kind: 'script',
          tool: 'package-json',
          frequency: 0,
          isFavorite: false,
          searchText: 'dev pnpm dev',
        }],
      }],
    });

    const result = createIntelligenceControllerResult(state, '/repo');

    expect(result.rankedActionIds).toEqual(['dev']);
  });
});
