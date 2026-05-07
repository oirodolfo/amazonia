import { describe, expect, it, vi } from 'vitest';
import { registerWorkbenchPersistenceIpc } from '../src/main/ipc/register-workbench-persistence-ipc';
import { emptyPersistedWorkbenchState } from '../src/shared/persistence/persistence-types';

describe('registerWorkbenchPersistenceIpc', () => {
  it('registers load and save handlers', async () => {
    const handlers = new Map<string, Function>();
    const ipcMain = { handle: vi.fn((channel: string, handler: Function) => handlers.set(channel, handler)) };
    const repository = {
      loadState: vi.fn(() => emptyPersistedWorkbenchState),
      saveState: vi.fn(),
      listTerminalSessions: vi.fn(() => []),
      saveTerminalSession: vi.fn(),
      saveRun: vi.fn(),
    };

    registerWorkbenchPersistenceIpc({ ipcMain: ipcMain as never, repository });

    expect(handlers.has('workbench:persistence:load-state')).toBe(true);
    expect(await handlers.get('workbench:persistence:load-state')!()).toEqual(emptyPersistedWorkbenchState);
  });
});
