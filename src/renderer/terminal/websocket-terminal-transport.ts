import type {WorkbenchClientMessage, WorkbenchServerMessage} from '@/shared/runtime/runtime-types';

export interface WebSocketTerminalTransport {
    send(message: WorkbenchClientMessage): void;

    onMessage(listener: (message: WorkbenchServerMessage) => void): () => void;

    reconnect(): void;

    close(): void;
}

/**
 * Creates a reconnecting WebSocket transport with outbound buffering.
 *
 * @param endpoint - WebSocket endpoint.
 * @returns Reconnecting WebSocket transport.
 *
 * @example
 * ```ts
 * const transport = createWebSocketTerminalTransport('ws://localhost:17333')
 * ```
 */
export function createWebSocketTerminalTransport(endpoint: string): WebSocketTerminalTransport {
    let socket: WebSocket | null = null;
    const listeners = new Set<(message: WorkbenchServerMessage) => void>();
    const queue: WorkbenchClientMessage[] = [];

    const connect = (): void => {
        socket = new WebSocket(endpoint);

        socket.addEventListener('open', () => {
            while (queue.length > 0) {
                socket?.send(JSON.stringify(queue.shift()));
            }
        });

        socket.addEventListener('message', (event) => {
            const message = JSON.parse(String(event.data)) as WorkbenchServerMessage;
            for (const listener of listeners) {
                listener(message);
            }
        });

        socket.addEventListener('close', () => {
            socket = null;
        });
    };

    connect();

    return {
        send(message) {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                queue.push(message);
                if (!socket) {
                    connect();
                }
                return;
            }

            socket.send(JSON.stringify(message));
        },

        onMessage(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },

        reconnect() {
            socket?.close();
            socket = null;
            connect();
        },

        close() {
            socket?.close();
            socket = null;
            queue.length = 0;
            listeners.clear();
        },
    };
}
