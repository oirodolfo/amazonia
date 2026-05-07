import { describe, expect, it } from 'vitest';
import { createWorkbenchHydrationPlan } from '../src/renderer/persistence/workbench-hydration';
import { emptyPersistedWorkbenchState } from '../src/shared/persistence/persistence-types';

describe('createWorkbenchHydrationPlan', () => {
  it('maps persisted state into renderer hydration data', () => {
    const plan = createWorkbenchHydrationPlan({
      ...emptyPersistedWorkbenchState,
      favoriteActionIds: ['action-1'],
    });

    expect(plan.store.favoriteActionIds).toEqual(['action-1']);
  });
});
