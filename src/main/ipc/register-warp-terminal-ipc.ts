import type { IpcMain } from 'electron';
import type { WarpPtyRuntime } from '@/main/terminal/warp-pty-runtime';
import type { TerminalSize, WorkbenchRuntime } from '@/shared/runtime/runtime-types';

export interface RegisterWarpTerminalIpcOptions {
  readonly ipcMain: Pick<IpcMain, 'handle'>;
  readonly runtime: WarpPtyRuntime;
}

/**
 * Registers PTY-backed Warp terminal IPC handlers.
 *
 * @param options - IPC main and runtime.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * registerWarpTerminalIpc({ ipcMain, runtime })
 * ```
 */
export function registerWarpTerminalIpc(options: RegisterWarpTerminalIpcOptions): void {
  options.ipcMain.handle('workbench:warp-terminal:open', (_event, input: {
    readonly title: string;
    readonly cwd: string;
    readonly runtime: WorkbenchRuntime;
    readonly size?: TerminalSize;
    readonly command?: string | null;
  }) => options.runtime.open(input));

  options.ipcMain.handle('workbench:warp-terminal:run-command', (_event, input: {
    readonly sessionId: string;
    readonly command: string;
  }) => options.runtime.runCommand(input.sessionId, input.command));

  options.ipcMain.handle('workbench:warp-terminal:write', (_event, input: {
    readonly sessionId: string;
    readonly data: string;
  }) => options.runtime.write(input.sessionId, input.data));

  options.ipcMain.handle('workbench:warp-terminal:resize', (_event, input: {
    readonly sessionId: string;
    readonly size: TerminalSize;
  }) => options.runtime.resize(input.sessionId, input.size));

  options.ipcMain.handle('workbench:warp-terminal:kill', (_event, input: {
    readonly sessionId: string;
  }) => options.runtime.kill(input.sessionId));

  options.ipcMain.handle('workbench:warp-terminal:list', () => options.runtime.list());
}
