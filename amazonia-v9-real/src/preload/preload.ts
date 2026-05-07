import { contextBridge, ipcRenderer } from 'electron';
import type { BridgeEvent, LayoutState, RunRecord, TerminalInputMessage, TerminalResizeMessage, TerminalSpawnRequest, WorkbenchBridge, WorkspaceManifest } from '@/shared';

const bridge: WorkbenchBridge & { openExternal(target: string): Promise<void>; openPath(target: string): Promise<void> } = {
  runtime: 'electron',
  openWorkspace: () => ipcRenderer.invoke('workspace:open') as Promise<WorkspaceManifest | null>,
  scanWorkspace: (rootPath: string) => ipcRenderer.invoke('workspace:scan', rootPath) as Promise<WorkspaceManifest>,
  spawnTerminal: (request: TerminalSpawnRequest) => ipcRenderer.invoke('terminal:spawn', request) as Promise<void>,
  writeTerminal: (message: TerminalInputMessage) => ipcRenderer.invoke('terminal:write', message) as Promise<void>,
  resizeTerminal: (message: TerminalResizeMessage) => ipcRenderer.invoke('terminal:resize', message) as Promise<void>,
  killTerminal: (tabId: string) => ipcRenderer.invoke('terminal:kill', tabId) as Promise<void>,
  persistLayout: (layout: LayoutState) => ipcRenderer.invoke('layout:write', layout) as Promise<void>,
  readLayout: () => ipcRenderer.invoke('layout:read') as Promise<LayoutState>,
  recordRun: (run: RunRecord) => ipcRenderer.invoke('runs:record', run) as Promise<void>,
  openExternal: (target: string) => ipcRenderer.invoke('native:openExternal', target) as Promise<void>,
  openPath: (target: string) => ipcRenderer.invoke('native:openPath', target) as Promise<void>,
  onEvent(listener: (event: BridgeEvent) => void) {
    const handler = (_event: Electron.IpcRendererEvent, payload: BridgeEvent): void => listener(payload);
    ipcRenderer.on('workbench:event', handler);
    return () => ipcRenderer.off('workbench:event', handler);
  },
};

contextBridge.exposeInMainWorld('curupiraWorkbench', bridge);
