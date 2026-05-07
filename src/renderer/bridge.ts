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
  private readonly pendingMessages: string[] = [];

  public constructor() {
    this.socket.addEventListener('open', () => {
      for (const message of this.pendingMessages.splice(0)) this.socket.send(message);
    });
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
    this.send({ type: 'workspace:scan', rootPath, requestId: crypto.randomUUID() });
    return new Promise((resolve) => {
      const off = this.onEvent((event) => {
        if (event.type === 'workspace:changed') {
          off();
          resolve(event.workspace);
        }
      });
    });
  }

  public async spawnTerminal(request: TerminalSpawnRequest): Promise<void> { this.send({ type: 'terminal:spawn', request, requestId: crypto.randomUUID() }); }
  public async writeTerminal(message: TerminalInputMessage): Promise<void> { this.send({ type: 'terminal:input', message, requestId: crypto.randomUUID() }); }
  public async resizeTerminal(message: TerminalResizeMessage): Promise<void> { this.send({ type: 'terminal:resize', message, requestId: crypto.randomUUID() }); }
  public async killTerminal(tabId: string): Promise<void> { this.send({ type: 'terminal:kill', tabId, requestId: crypto.randomUUID() }); }
  public async persistLayout(layout: LayoutState): Promise<void> { localStorage.setItem('amazonia.layout', JSON.stringify(layout)); }
  public async readLayout(): Promise<LayoutState> { return JSON.parse(localStorage.getItem('amazonia.layout') ?? JSON.stringify(DEFAULT_LAYOUT)) as LayoutState; }
  public async recordRun(run: RunRecord): Promise<void> { localStorage.setItem(`amazonia.run.${run.id}`, JSON.stringify(run)); }
  public onEvent(listener: (event: BridgeEvent) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  private send(payload: unknown): void {
    const serialized = JSON.stringify(payload);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(serialized);
      return;
    }
    this.pendingMessages.push(serialized);
  }
}

export const bridge: WorkbenchBridge & { openExternal?(target: string): Promise<void>; openPath?(target: string): Promise<void> } = window.curupiraWorkbench ?? new WebSocketWorkbenchBridge();
