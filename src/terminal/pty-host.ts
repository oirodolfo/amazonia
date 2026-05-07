import os from 'node:os';
import type {IPty} from 'node-pty';
import pty from 'node-pty';
import type {TerminalSpawnRequest} from '@/shared/types';

export interface PtyHostHandlers {
    readonly onData: (tabId: string, data: string) => void;
    readonly onExit: (tabId: string, exitCode: number) => void;
}

export class PtyHost {
    private readonly processes = new Map<string, IPty>();

    public constructor(private readonly handlers: PtyHostHandlers) {
    }

    /**
     * Starts an interactive shell and optionally writes an action command into it.
     *
     * @param request - Terminal tab spawn request.
     * @returns Nothing once the process is attached.
     *
     * @example
     * ```ts
     * host.spawn({ tabId: 'one', cwd: '/repo', command: 'pnpm test', cols: 120, rows: 30 });
     * ```
     */
    public spawn(request: TerminalSpawnRequest): void {
        const shell = resolveShell();
        const child = pty.spawn(shell.command, [...shell.args], {
            name: 'xterm-256color',
            cols: request.cols,
            rows: request.rows,
            cwd: request.cwd,
            env: process.env,
        });

        child.onData((data) => this.handlers.onData(request.tabId, data));
        child.onExit(({exitCode}) => {
            this.processes.delete(request.tabId);
            this.handlers.onExit(request.tabId, exitCode);
        });
        this.processes.set(request.tabId, child);

        if (request.command !== undefined) {
            child.write(`${request.command}${os.EOL}`);
        }
    }

    /**
     * Writes raw input into an existing terminal tab.
     *
     * @param tabId - Terminal tab identifier.
     * @param data - Raw terminal input.
     * @returns Nothing.
     *
     * @example
     * ```ts
     * host.write('one', 'ls\r');
     * ```
     */
    public write(tabId: string, data: string): void {
        this.processes.get(tabId)?.write(data);
    }

    /**
     * Resizes a terminal process to match the UI panel.
     *
     * @param tabId - Terminal tab identifier.
     * @param cols - Character columns.
     * @param rows - Character rows.
     * @returns Nothing.
     *
     * @example
     * ```ts
     * host.resize('one', 100, 24);
     * ```
     */
    public resize(tabId: string, cols: number, rows: number): void {
        this.processes.get(tabId)?.resize(cols, rows);
    }

    /**
     * Stops a terminal process if it is still alive.
     *
     * @param tabId - Terminal tab identifier.
     * @returns Nothing.
     *
     * @example
     * ```ts
     * host.kill('one');
     * ```
     */
    public kill(tabId: string): void {
        this.processes.get(tabId)?.kill();
        this.processes.delete(tabId);
    }
}

function resolveShell(): { readonly command: string; readonly args: readonly string[] } {
    if (process.platform === 'win32') return {command: process.env.ComSpec ?? 'powershell.exe', args: []};
    return {command: process.env.SHELL ?? '/bin/zsh', args: []};
}
