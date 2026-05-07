import type { IntegratedRuntimeState } from '@/shared/runtime/integrated-runtime-store';
import type { IpcRendererLike } from './workbench-full-api';

export interface IntegratedRuntimeApi {
  getState(): Promise<IntegratedRuntimeState>;
  clear(): Promise<boolean>;
  onState(listener: (state: IntegratedRuntimeState) => void): () => void;
}

/**
 * Creates the integrated runtime preload API.
 *
 * @param ipcRenderer - Electron ipcRenderer-like object.
 * @returns Integrated runtime API.
 *
 * @example
 * ```ts
 * const runtime = createIntegratedRuntimeApi(ipcRenderer)
 * ```
 */
export function createIntegratedRuntimeApi(ipcRenderer: IpcRendererLike): IntegratedRuntimeApi {
  return {
    getState: () => ipcRenderer.invoke('workbench:runtime:get-state') as Promise<IntegratedRuntimeState>,
    clear: () => ipcRenderer.invoke('workbench:runtime:clear') as Promise<boolean>,
    onState(listener) {
      const wrapped = (_event: unknown, payload: unknown): void => listener(payload as IntegratedRuntimeState);
      ipcRenderer.on('workbench:runtime:state', wrapped);
      return () => ipcRenderer.removeListener('workbench:runtime:state', wrapped);
    },
  };
}
