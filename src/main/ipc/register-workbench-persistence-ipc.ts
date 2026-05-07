import type {IpcMain} from 'electron';
import type {PersistedWorkbenchState} from '@/shared/persistence/persistence-types';
import type {TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';
import type {RunSummary} from '@/shared/actions/action-types';
import type {WorkbenchRepository} from '@/main/persistence/workbench-repository';

export interface RegisterWorkbenchPersistenceIpcOptions {
    readonly ipcMain: Pick<IpcMain, 'handle'>;
    readonly repository: WorkbenchRepository;
}

/**
 * Registers persistence IPC handlers used by the renderer hydration and autosave flows.
 *
 * @param options - IPC main instance and repository.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * registerWorkbenchPersistenceIpc({ ipcMain, repository })
 * ```
 */
export function registerWorkbenchPersistenceIpc(options: RegisterWorkbenchPersistenceIpcOptions): void {
    options.ipcMain.handle('workbench:persistence:load-state', () => {
        return options.repository.loadState();
    });

    options.ipcMain.handle('workbench:persistence:save-state', (_event, state: PersistedWorkbenchState) => {
        options.repository.saveState(state);
        return true;
    });

    options.ipcMain.handle('workbench:persistence:list-terminal-sessions', () => {
        return options.repository.listTerminalSessions();
    });

    options.ipcMain.handle('workbench:persistence:save-terminal-session', (_event, session: TerminalSessionSnapshot) => {
        options.repository.saveTerminalSession(session);
        return true;
    });

    options.ipcMain.handle('workbench:persistence:save-run', (_event, run: RunSummary) => {
        options.repository.saveRun(run);
        return true;
    });
}
