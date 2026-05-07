import type {
    TerminalDataFrame,
    TerminalSessionSnapshot,
    TerminalSize,
    WorkbenchRuntime
} from '@/shared/runtime/runtime-types';
import type {IpcRendererLike} from './workbench-full-api';

export interface WarpTerminalApi {
    open(input: {
        readonly title: string;
        readonly cwd: string;
        readonly runtime: WorkbenchRuntime;
        readonly size?: TerminalSize;
        readonly command?: string | null;
    }): Promise<TerminalSessionSnapshot>;

    runCommand(input: { readonly sessionId: string; readonly command: string }): Promise<boolean>;

    write(input: { readonly sessionId: string; readonly data: string }): Promise<boolean>;

    resize(input: { readonly sessionId: string; readonly size: TerminalSize }): Promise<boolean>;

    kill(input: { readonly sessionId: string }): Promise<boolean>;

    list(): Promise<TerminalSessionSnapshot[]>;

    onData(listener: (frame: TerminalDataFrame) => void): () => void;
}

/**
 * Creates the preload API for the PTY-backed Warp terminal.
 *
 * @param ipcRenderer - Electron IPC renderer.
 * @returns Warp terminal API.
 */
export function createWarpTerminalApi(ipcRenderer: IpcRendererLike): WarpTerminalApi {
    return {
        open: (input) => ipcRenderer.invoke('workbench:warp-terminal:open', input) as Promise<TerminalSessionSnapshot>,
        runCommand: (input) => ipcRenderer.invoke('workbench:warp-terminal:run-command', input) as Promise<boolean>,
        write: (input) => ipcRenderer.invoke('workbench:warp-terminal:write', input) as Promise<boolean>,
        resize: (input) => ipcRenderer.invoke('workbench:warp-terminal:resize', input) as Promise<boolean>,
        kill: (input) => ipcRenderer.invoke('workbench:warp-terminal:kill', input) as Promise<boolean>,
        list: () => ipcRenderer.invoke('workbench:warp-terminal:list') as Promise<TerminalSessionSnapshot[]>,
        onData(listener) {
            const wrapped = (_event: unknown, payload: unknown): void => listener(payload as TerminalDataFrame);
            ipcRenderer.on('workbench:terminal:data', wrapped);
            return () => ipcRenderer.removeListener('workbench:terminal:data', wrapped);
        },
    };
}
