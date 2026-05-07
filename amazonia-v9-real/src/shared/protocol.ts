import type { BridgeEvent, LayoutState, RunRecord, TerminalInputMessage, TerminalResizeMessage, TerminalSpawnRequest, WorkspaceManifest } from './types';

export interface WorkbenchBridge {
  readonly runtime: 'electron' | 'web';
  openWorkspace(): Promise<WorkspaceManifest | null>;
  scanWorkspace(rootPath: string): Promise<WorkspaceManifest>;
  spawnTerminal(request: TerminalSpawnRequest): Promise<void>;
  writeTerminal(message: TerminalInputMessage): Promise<void>;
  resizeTerminal(message: TerminalResizeMessage): Promise<void>;
  killTerminal(tabId: string): Promise<void>;
  persistLayout(layout: LayoutState): Promise<void>;
  readLayout(): Promise<LayoutState>;
  recordRun(run: RunRecord): Promise<void>;
  onEvent(listener: (event: BridgeEvent) => void): () => void;
}

export const DEFAULT_LAYOUT: LayoutState = { sidebarSize: 22, terminalSize: 52, outputSize: 26 };
