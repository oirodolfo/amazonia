import { DEFAULT_LAYOUT, type BridgeEvent, type LayoutState, type RunRecord, type TerminalInputMessage, type TerminalResizeMessage, type TerminalSpawnRequest, type WorkbenchBridge, type WorkspaceManifest } from '@/shared';

declare global {
  interface Window {
    curupiraWorkbench?: WorkbenchBridge & { openExternal(target: string): Promise<void>; openPath(target: string): Promise<void> };
  }
}

class WebSocketWorkbenchBridge implements WorkbenchBridge {
  public readonly runtime = 'web' as const;
  private readonly listeners = new Set<(event: BridgeEvent) => void>();
  private readonly socket = new WebSocket(`ws://localhost:${import.meta.env.VITE_AMAZONIA_WEB_SOCKET_PORT ?? '4127'}`);

  public constructor() {
    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data)) as BridgeEvent;
      for (const listener of this.listeners) listener(payload);
    });
  }

  public async openWorkspace(): Promise<WorkspaceManifest | null> {
    const rootPath = window.prompt('Workspace path');
    return rootPath === null || rootPath.trim() === '' ? null : this.scanWorkspace(rootPath);
  }

  public async scanWorkspace(rootPath: string): Promise<WorkspaceManifest> {
    this.socket.send(JSON.stringify({ type: 'workspace:scan', rootPath }));
    return new Promise((resolve) => {
      const off = this.onEvent((event) => {
        if (event.type === 'workspace:changed') {
          off();
          resolve(event.workspace);
        }
      });
    });
  }

  public async spawnTerminal(request: TerminalSpawnRequest): Promise<void> { this.socket.send(JSON.stringify({ type: 'terminal:spawn', request })); }
  public async writeTerminal(message: TerminalInputMessage): Promise<void> { this.socket.send(JSON.stringify({ type: 'terminal:input', message })); }
  public async resizeTerminal(message: TerminalResizeMessage): Promise<void> { this.socket.send(JSON.stringify({ type: 'terminal:resize', message })); }
  public async killTerminal(tabId: string): Promise<void> { this.socket.send(JSON.stringify({ type: 'terminal:kill', tabId })); }
  public async persistLayout(layout: LayoutState): Promise<void> { localStorage.setItem('amazonia.layout', JSON.stringify(layout)); }
  public async readLayout(): Promise<LayoutState> { return JSON.parse(localStorage.getItem('amazonia.layout') ?? JSON.stringify(DEFAULT_LAYOUT)) as LayoutState; }
  public async recordRun(run: RunRecord): Promise<void> { localStorage.setItem(`amazonia.run.${run.id}`, JSON.stringify(run)); }
  public onEvent(listener: (event: BridgeEvent) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
}

export const bridge: WorkbenchBridge & { openExternal?(target: string): Promise<void>; openPath?(target: string): Promise<void> } = window.curupiraWorkbench ?? new WebSocketWorkbenchBridge();
