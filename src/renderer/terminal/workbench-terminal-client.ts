import type {
  RunActionInput,
  TerminalSessionSnapshot,
  TerminalSize,
  WorkbenchRuntime,
} from '@/shared/runtime/runtime-types';

export interface WorkbenchTerminalClient {
  readonly runtime: WorkbenchRuntime;
  runAction(input: RunActionInput): Promise<TerminalSessionSnapshot>;
  write(sessionId: string, data: string): Promise<void>;
  resize(sessionId: string, size: TerminalSize): Promise<void>;
  kill(sessionId: string): Promise<void>;
}

/**
 * Creates a renderer terminal client for Electron or Web mode.
 *
 * @param runtime - Active runtime.
 * @param endpoint - Optional WebSocket endpoint for Web mode.
 * @returns Terminal client facade.
 *
 * @example
 * ```ts
 * const client = createWorkbenchTerminalClient('electron')
 * ```
 */
export function createWorkbenchTerminalClient(
  runtime: WorkbenchRuntime,
  endpoint = 'ws://localhost:17333',
): WorkbenchTerminalClient {
  if (runtime === 'electron') {
    return createElectronClient();
  }

  return createWebSocketClient(endpoint);
}

function createElectronClient(): WorkbenchTerminalClient {
  return {
    runtime: 'electron',
    async runAction(input) {
      const api = window.workbench?.terminal;
      if (!api) {
        throw new Error('Electron workbench terminal API is not available');
      }

      return api.runAction(input);
    },
    async write(sessionId, data) {
      await window.workbench?.terminal.write({ sessionId, data });
    },
    async resize(sessionId, size) {
      await window.workbench?.terminal.resize({ sessionId, size });
    },
    async kill(sessionId) {
      await window.workbench?.terminal.kill({ sessionId });
    },
  };
}

function createWebSocketClient(endpoint: string): WorkbenchTerminalClient {
  let socket: WebSocket | null = null;

  function getSocket(): WebSocket {
    if (socket && socket.readyState <= WebSocket.OPEN) {
      return socket;
    }

    socket = new WebSocket(endpoint);
    return socket;
  }

  function send(payload: unknown): void {
    const activeSocket = getSocket();
    const encoded = JSON.stringify(payload);

    if (activeSocket.readyState === WebSocket.OPEN) {
      activeSocket.send(encoded);
      return;
    }

    activeSocket.addEventListener('open', () => activeSocket.send(encoded), { once: true });
  }

  return {
    runtime: 'web',
    async runAction(input) {
      send({ type: 'terminal.runAction', payload: input });
      return {
        id: `pending_${Date.now()}`,
        title: input.title,
        cwd: input.cwd,
        command: input.command,
        runtime: 'web',
        status: 'connecting',
        size: input.size ?? { cols: 120, rows: 32 },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        exitCode: null,
      };
    },
    async write(sessionId, data) {
      send({ type: 'terminal.input', payload: { sessionId, data } });
    },
    async resize(sessionId, size) {
      send({ type: 'terminal.resize', payload: { sessionId, size } });
    },
    async kill(sessionId) {
      send({ type: 'terminal.kill', payload: { sessionId } });
    },
  };
}
