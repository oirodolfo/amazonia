import { describe, expect, it } from 'vitest';
import { normalizePersistedWorkbenchState } from '../src/shared/persistence/persistence-types';

describe('normalizePersistedWorkbenchState', () => {
  it('returns safe defaults for invalid values', () => {
    const state = normalizePersistedWorkbenchState(null);

    expect(state.favoriteActionIds).toEqual([]);
    expect(state.terminalSessions).toEqual([]);
  });

  it('preserves valid frequency records', () => {
    const state = normalizePersistedWorkbenchState({
      actionFrequencies: { dev: 3 },
    });

    expect(state.actionFrequencies.dev).toBe(3);
  });
});
