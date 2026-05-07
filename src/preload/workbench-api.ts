import type {
    CreateTerminalSessionInput,
    RunActionInput,
    TerminalSessionSnapshot,
    TerminalSize,
} from '@/shared/runtime/runtime-types';

export interface WorkbenchTerminalApi {
    create(input: CreateTerminalSessionInput): Promise<TerminalSessionSnapshot>;

    runAction(input: RunActionInput): Promise<TerminalSessionSnapshot>;

    write(input: { readonly sessionId: string; readonly data: string }): Promise<boolean>;

    resize(input: { readonly sessionId: string; readonly size: TerminalSize }): Promise<boolean>;

    kill(input: { readonly sessionId: string }): Promise<boolean>;

    list(): Promise<TerminalSessionSnapshot[]>;
}

export interface WorkbenchWindowApi {
    readonly terminal: WorkbenchTerminalApi;
}

/**
 * Creates the secure preload API exposed to the renderer.
 *
 * @param ipcRenderer - Electron ipcRenderer-like object.
 * @returns Renderer-safe workbench API.
 *
 * @example
 * ```ts
 * const api = createWorkbenchApi(ipcRenderer)
 * ```
 */
export function createWorkbenchApi(ipcRenderer: {
    invoke(channel: string, input?: unknown): Promise<unknown>;
}): WorkbenchWindowApi {
    return {
        terminal: {
            create: (input) => ipcRenderer.invoke('workbench:terminal:create', input) as Promise<TerminalSessionSnapshot>,
            runAction: (input) => ipcRenderer.invoke('workbench:terminal:run-action', input) as Promise<TerminalSessionSnapshot>,
            write: (input) => ipcRenderer.invoke('workbench:terminal:write', input) as Promise<boolean>,
            resize: (input) => ipcRenderer.invoke('workbench:terminal:resize', input) as Promise<boolean>,
            kill: (input) => ipcRenderer.invoke('workbench:terminal:kill', input) as Promise<boolean>,
            list: () => ipcRenderer.invoke('workbench:terminal:list') as Promise<TerminalSessionSnapshot[]>,
        },
    };
}
