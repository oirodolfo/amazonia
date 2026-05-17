import { describe, expect, it } from 'vitest';
import { createIntelligenceViewModel } from '../src/renderer/intelligence/intelligence-view-model';
import { emptyWorkbenchStoreSnapshot } from '../src/shared/persistence/workbench-store';
import type { WorkspaceAction } from '../src/shared/actions/action-types';

const action: WorkspaceAction = {
  id: 'dev',
  packageId: 'pkg',
  packageName: '@pkg/demo',
  label: 'dev',
  command: 'pnpm dev',
  cwd: '/repo',
  kind: 'script',
  weight: 0,
};

describe('createIntelligenceViewModel', () => {
  it('uses persisted frequency from store', () => {
    const model = createIntelligenceViewModel({
      actions: [action],
      store: {
        ...emptyWorkbenchStoreSnapshot,
        actionFrequencies: { dev: 7 },
      },
      currentCwd: '/repo',
      currentPackageId: 'pkg',
      query: 'dev',
      now: 100,
    });

    expect(model.rankedActions[0]?.usage.frequency).toBe(7);
    expect(model.suggestions[0]?.actionId).toBe('dev');
  });
});
