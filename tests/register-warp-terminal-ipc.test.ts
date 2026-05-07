import { describe, expect, it, vi } from 'vitest';
import { registerWarpTerminalIpc } from '../src/main/ipc/register-warp-terminal-ipc';

describe('registerWarpTerminalIpc', () => {
  it('registers all warp terminal IPC handlers', () => {
    const handlers = new Map<string, Function>();
    const ipcMain = {
      handle: vi.fn((channel: string, handler: Function) => handlers.set(channel, handler)),
    };

    registerWarpTerminalIpc({
      ipcMain: ipcMain as never,
      runtime: {
        open: vi.fn(),
        runCommand: vi.fn(),
        write: vi.fn(),
        resize: vi.fn(),
        kill: vi.fn(),
        list: vi.fn(),
      } as never,
    });

    expect(handlers.has('workbench:warp-terminal:open')).toBe(true);
    expect(handlers.has('workbench:warp-terminal:run-command')).toBe(true);
  });
});
