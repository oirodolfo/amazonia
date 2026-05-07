import type {IpcMain} from 'electron';
import type {NodePtyTerminalManager} from '@/main/terminal/node-pty-terminal-manager';
import type {CreateTerminalSessionInput, RunActionInput, TerminalSize} from '@/shared/runtime/runtime-types';

export interface RegisterTerminalIpcOptions {
    readonly ipcMain: Pick<IpcMain, 'handle'>;
    readonly terminalManager: NodePtyTerminalManager;
}

/**
 * Registers secure terminal IPC handlers for the Electron runtime.
 *
 * @param options - IPC main instance and terminal manager.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * registerTerminalIpc({ ipcMain, terminalManager })
 * ```
 */
export function registerTerminalIpc(options: RegisterTerminalIpcOptions): void {
    options.ipcMain.handle('workbench:terminal:create', (_event, input: CreateTerminalSessionInput) => {
        return options.terminalManager.createSession(input);
    });

    options.ipcMain.handle('workbench:terminal:run-action', (_event, input: RunActionInput) => {
        return options.terminalManager.runAction(input);
    });

    options.ipcMain.handle('workbench:terminal:write', (_event, input: { sessionId: string; data: string }) => {
        return options.terminalManager.write(input.sessionId, input.data);
    });

    options.ipcMain.handle('workbench:terminal:resize', (_event, input: { sessionId: string; size: TerminalSize }) => {
        return options.terminalManager.resize(input.sessionId, input.size);
    });

    options.ipcMain.handle('workbench:terminal:kill', (_event, input: { sessionId: string }) => {
        return options.terminalManager.kill(input.sessionId);
    });

    options.ipcMain.handle('workbench:terminal:list', () => {
        return options.terminalManager.listSessions();
    });
}
