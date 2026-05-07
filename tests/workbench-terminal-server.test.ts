import { describe, expect, it, vi } from 'vitest';
import { handleClientMessage } from '../src/server/workbench-terminal-server';

describe('handleClientMessage', () => {
  it('routes runAction messages to the terminal manager', () => {
    const runAction = vi.fn(() => ({
      id: 'term-1',
      title: 'dev',
      cwd: '/repo',
      command: 'pnpm dev',
      runtime: 'web',
      status: 'running',
      size: { cols: 120, rows: 32 },
      createdAt: 1,
      updatedAt: 1,
      exitCode: null,
    }));

    const respond = vi.fn();

    handleClientMessage(
      {
        type: 'terminal.runAction',
        payload: {
          actionId: 'dev',
          title: 'dev',
          command: 'pnpm dev',
          cwd: '/repo',
          runtime: 'web',
        },
      },
      {
        runAction,
        createSession: vi.fn(),
        write: vi.fn(),
        resize: vi.fn(),
        kill: vi.fn(),
        listSessions: vi.fn(),
      } as never,
      respond,
    );

    expect(runAction).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(expect.objectContaining({ type: 'terminal.created' }));
  });
});
