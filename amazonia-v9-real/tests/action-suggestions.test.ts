import { describe, expect, it } from 'vitest';
import { suggestActions } from '../src/intelligence';
import type { WorkspaceAction } from '../src/shared/types';

const action: WorkspaceAction = {
  id: 'a',
  packageId: 'p',
  packageName: '@curupira/app',
  label: 'test',
  command: 'pnpm test',
  cwd: '/repo',
  kind: 'script',
  weight: 90,
};

describe('suggestActions', () => {
  it('boosts frequent local actions', () => {
    const [suggestion] = suggestActions([action], [{ actionId: 'a', runCount: 4, successCount: 3, failureCount: 1 }]);

    expect(suggestion?.reason).toBe('frequent');
    expect(suggestion?.score).toBeGreaterThan(action.weight);
  });
});
