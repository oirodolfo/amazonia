import type { DiagnosticLocation } from '@/shared/diagnostics/actionable-diagnostic-types';
import type { IpcRendererLike } from './workbench-full-api';

export interface DiagnosticActionsApi {
  openLocation(location: DiagnosticLocation | null): Promise<boolean>;
}

/**
 * Creates the preload diagnostics API.
 *
 * @param ipcRenderer - Electron IPC renderer.
 * @returns Diagnostic actions API.
 *
 * @example
 * ```ts
 * const api = createDiagnosticActionsApi(ipcRenderer)
 * ```
 */
export function createDiagnosticActionsApi(
  ipcRenderer: IpcRendererLike,
): DiagnosticActionsApi {
  return {
    openLocation: (location) => ipcRenderer.invoke('workbench:diagnostics:open-location', location) as Promise<boolean>,
  };
}
