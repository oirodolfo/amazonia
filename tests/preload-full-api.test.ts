import { describe, expect, it, vi } from 'vitest';
import { createWorkbenchFullApi } from '../src/preload/workbench-full-api';

describe('createWorkbenchFullApi', () => {
  it('routes terminal and persistence calls through IPC', async () => {
    const invoke = vi.fn(async () => true);
    const api = createWorkbenchFullApi({
      invoke,
      on: vi.fn(),
      removeListener: vi.fn(),
    });

    await api.terminal.write({ sessionId: 'term', data: 'x' });
    await api.persistence.saveState({
      actionFrequencies: {},
      favoriteActionIds: [],
      pinnedPackageIds: [],
      layout: {},
      terminalSessions: [],
    });

    expect(invoke).toHaveBeenCalledWith('workbench:terminal:write', { sessionId: 'term', data: 'x' });
    expect(invoke).toHaveBeenCalledWith('workbench:persistence:save-state', expect.any(Object));
  });
});
