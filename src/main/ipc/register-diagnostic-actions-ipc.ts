import type {IpcMain} from 'electron';
import type {DiagnosticLocation} from '@/shared/diagnostics/actionable-diagnostic-types';

export interface RegisterDiagnosticActionsIpcOptions {
    readonly ipcMain: Pick<IpcMain, 'handle'>;
    readonly openDiagnosticLocation: (location: DiagnosticLocation | null) => Promise<boolean>;
}

/**
 * Registers IPC handlers for actionable diagnostics.
 *
 * @param options - IPC main and openers.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * registerDiagnosticActionsIpc({ ipcMain, openDiagnosticLocation })
 * ```
 */
export function registerDiagnosticActionsIpc(
    options: RegisterDiagnosticActionsIpcOptions,
): void {
    options.ipcMain.handle('workbench:diagnostics:open-location', (_event, location: DiagnosticLocation | null) => {
        return options.openDiagnosticLocation(location);
    });
}
