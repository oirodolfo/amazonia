import { describe, expect, it, vi } from 'vitest';
import { createWebSocketTerminalTransport } from '../src/renderer/terminal/websocket-terminal-transport';

class FakeWebSocket {
  static OPEN = 1;
  readyState = 0;
  sent: string[] = [];
  listeners = new Map<string, Function[]>();

  constructor(public endpoint: string) {}

  addEventListener(name: string, listener: Function): void {
    const list = this.listeners.get(name) ?? [];
    list.push(listener);
    this.listeners.set(name, list);
  }

  send(value: string): void {
    this.sent.push(value);
  }

  close(): void {
    this.readyState = 3;
  }

  emit(name: string, payload: unknown = {}): void {
    for (const listener of this.listeners.get(name) ?? []) {
      listener(payload);
    }
  }
}

describe('createWebSocketTerminalTransport', () => {
  it('buffers messages until open', () => {
    const sockets: FakeWebSocket[] = [];
    vi.stubGlobal('WebSocket', class extends FakeWebSocket {
      static OPEN = 1;
      constructor(endpoint: string) {
        super(endpoint);
        sockets.push(this);
      }
    });

    const transport = createWebSocketTerminalTransport('ws://localhost:1');
    transport.send({ type: 'terminal.kill', payload: { sessionId: 'term-1' } });
    sockets[0]!.readyState = FakeWebSocket.OPEN;
    sockets[0]!.emit('open');

    expect(sockets[0]!.sent).toHaveLength(1);
    vi.unstubAllGlobals();
  });
});
