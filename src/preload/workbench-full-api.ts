import type { RunSummary } from '@/shared/actions/action-types';
import type { OpenTarget } from '@/shared/openers/open-targets';
import type { PersistedWorkbenchState } from '@/shared/persistence/persistence-types';
import type {
  CreateTerminalSessionInput,
  RunActionInput,
  TerminalDataFrame,
  TerminalSessionSnapshot,
  TerminalSize,
} from '@/shared/runtime/runtime-types';

export interface WorkbenchFullApi {
  readonly terminal: {
    create(input: CreateTerminalSessionInput): Promise<TerminalSessionSnapshot>;
    runAction(input: RunActionInput): Promise<TerminalSessionSnapshot>;
    write(input: { readonly sessionId: string; readonly data: string }): Promise<boolean>;
    resize(input: { readonly sessionId: string; readonly size: TerminalSize }): Promise<boolean>;
    kill(input: { readonly sessionId: string }): Promise<boolean>;
    list(): Promise<TerminalSessionSnapshot[]>;
    onData(listener: (frame: TerminalDataFrame) => void): () => void;
    onStatus(listener: (snapshot: TerminalSessionSnapshot) => void): () => void;
    onExit(listener: (snapshot: TerminalSessionSnapshot) => void): () => void;
  };
  readonly persistence: {
    loadState(): Promise<PersistedWorkbenchState>;
    saveState(state: PersistedWorkbenchState): Promise<boolean>;
    listTerminalSessions(): Promise<TerminalSessionSnapshot[]>;
    saveTerminalSession(session: TerminalSessionSnapshot): Promise<boolean>;
    saveRun(run: RunSummary): Promise<boolean>;
  };
  readonly openers: {
    openTarget(target: OpenTarget): Promise<boolean>;
    openUrl(url: string): Promise<boolean>;
  };
}

export interface IpcRendererLike {
  invoke(channel: string, input?: unknown): Promise<unknown>;
  on(channel: string, listener: (_event: unknown, payload: unknown) => void): void;
  removeListener(channel: string, listener: (_event: unknown, payload: unknown) => void): void;
}

declare global {
  interface Window {
    readonly workbench?: WorkbenchFullApi;
  }
}

/**
 * Creates the full preload API consumed by the renderer.
 *
 * @param ipcRenderer - Electron ipcRenderer-like object.
 * @returns Secure renderer-facing API.
 *
 * @example
 * ```ts
 * contextBridge.exposeInMainWorld('workbench', createWorkbenchFullApi(ipcRenderer))
 * ```
 */
export function createWorkbenchFullApi(ipcRenderer: IpcRendererLike): WorkbenchFullApi {
  return {
    terminal: {
      create: (input) => ipcRenderer.invoke('workbench:terminal:create', input) as Promise<TerminalSessionSnapshot>,
      runAction: (input) => ipcRenderer.invoke('workbench:terminal:run-action', input) as Promise<TerminalSessionSnapshot>,
      write: (input) => ipcRenderer.invoke('workbench:terminal:write', input) as Promise<boolean>,
      resize: (input) => ipcRenderer.invoke('workbench:terminal:resize', input) as Promise<boolean>,
      kill: (input) => ipcRenderer.invoke('workbench:terminal:kill', input) as Promise<boolean>,
      list: () => ipcRenderer.invoke('workbench:terminal:list') as Promise<TerminalSessionSnapshot[]>,
      onData: (listener) => subscribe(ipcRenderer, 'workbench:terminal:data', listener),
      onStatus: (listener) => subscribe(ipcRenderer, 'workbench:terminal:status', listener),
      onExit: (listener) => subscribe(ipcRenderer, 'workbench:terminal:exit', listener),
    },
    persistence: {
      loadState: () => ipcRenderer.invoke('workbench:persistence:load-state') as Promise<PersistedWorkbenchState>,
      saveState: (state) => ipcRenderer.invoke('workbench:persistence:save-state', state) as Promise<boolean>,
      listTerminalSessions: () => ipcRenderer.invoke('workbench:persistence:list-terminal-sessions') as Promise<TerminalSessionSnapshot[]>,
      saveTerminalSession: (session) => ipcRenderer.invoke('workbench:persistence:save-terminal-session', session) as Promise<boolean>,
      saveRun: (run) => ipcRenderer.invoke('workbench:persistence:save-run', run) as Promise<boolean>,
    },
    openers: {
      openTarget: (target) => ipcRenderer.invoke('workbench:open-target', target) as Promise<boolean>,
      openUrl: (url) => ipcRenderer.invoke('workbench:open-url', url) as Promise<boolean>,
    },
  };
}

function subscribe<T>(
  ipcRenderer: IpcRendererLike,
  channel: string,
  listener: (payload: T) => void,
): () => void {
  const wrapped = (_event: unknown, payload: unknown): void => listener(payload as T);
  ipcRenderer.on(channel, wrapped);

  return () => ipcRenderer.removeListener(channel, wrapped);
}
