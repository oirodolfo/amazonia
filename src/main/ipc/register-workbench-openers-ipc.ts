import type {IpcMain} from 'electron';
import type {OpenTarget} from '@/shared/openers/open-targets';

export interface RegisterWorkbenchOpenersIpcOptions {
    readonly ipcMain: Pick<IpcMain, 'handle'>;
    readonly openTarget: (target: OpenTarget) => Promise<void>;
    readonly openExternal: (url: string) => Promise<void>;
}

/**
 * Registers safe opener IPC handlers for browser URLs and editor targets.
 *
 * @param options - IPC main and opener callbacks.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * registerWorkbenchOpenersIpc({ ipcMain, openTarget, openExternal })
 * ```
 */
export function registerWorkbenchOpenersIpc(options: RegisterWorkbenchOpenersIpcOptions): void {
    options.ipcMain.handle('workbench:open-target', async (_event, target: OpenTarget) => {
        await options.openTarget(target);
        return true;
    });

    options.ipcMain.handle('workbench:open-url', async (_event, url: string) => {
        await options.openExternal(url);
        return true;
    });
}
