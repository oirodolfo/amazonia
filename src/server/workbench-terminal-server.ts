import {type WebSocket, WebSocketServer} from 'ws';
import type {NodePtyTerminalManager} from '@/main/terminal/node-pty-terminal-manager';
import type {WorkbenchClientMessage, WorkbenchServerMessage} from '@/shared/runtime/runtime-types';

export interface WorkbenchTerminalServerOptions {
    readonly port: number;
    readonly terminalManager: NodePtyTerminalManager;
}

/**
 * Starts the Web runtime terminal bridge.
 *
 * @param options - Port and terminal manager.
 * @returns WebSocket server instance.
 *
 * @example
 * ```ts
 * startWorkbenchTerminalServer({ port: 17333, terminalManager })
 * ```
 */
export function startWorkbenchTerminalServer(options: WorkbenchTerminalServerOptions): WebSocketServer {
    const server = new WebSocketServer({port: options.port});
    const clients = new Set<WebSocket>();

    server.on('connection', (client) => {
        clients.add(client);

        client.on('close', () => {
            clients.delete(client);
        });

        client.on('message', (raw) => {
            try {
                const message = JSON.parse(String(raw)) as WorkbenchClientMessage;
                handleClientMessage(message, options.terminalManager, (response) => {
                    send(client, response);
                });
            } catch (error) {
                send(client, {
                    type: 'error',
                    payload: {
                        message: 'Invalid workbench message',
                        cause: error instanceof Error ? error.message : String(error),
                    },
                });
            }
        });
    });

    return server;
}

/**
 * Handles a terminal WebSocket message.
 *
 * @param message - Client message.
 * @param terminalManager - Terminal manager.
 * @param respond - Response sender.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * handleClientMessage(message, manager, send)
 * ```
 */
export function handleClientMessage(
    message: WorkbenchClientMessage,
    terminalManager: NodePtyTerminalManager,
    respond: (message: WorkbenchServerMessage) => void,
): void {
    switch (message.type) {
        case 'terminal.create':
            respond({type: 'terminal.created', payload: terminalManager.createSession(message.payload)});
            return;

        case 'terminal.runAction':
            respond({type: 'terminal.created', payload: terminalManager.runAction(message.payload)});
            return;

        case 'terminal.input':
            terminalManager.write(message.payload.sessionId, message.payload.data);
            return;

        case 'terminal.resize':
            terminalManager.resize(message.payload.sessionId, message.payload.size);
            return;

        case 'terminal.kill':
            terminalManager.kill(message.payload.sessionId);
            return;

        case 'workspace.scan':
            respond({
                type: 'workspace.scanned',
                payload: {
                    root: message.payload.root,
                    scannedAt: Date.now(),
                },
            });
            return;
    }
}

function send(client: WebSocket, message: WorkbenchServerMessage): void {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
    }
}
