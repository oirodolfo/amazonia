import { describe, expect, it, vi } from 'vitest';
import { NodePtyTerminalManager, type PtyLikeModule, type PtyLikeProcess } from '../src/main/terminal/node-pty-terminal-manager';

function createPtyMock(): {
  readonly pty: PtyLikeModule;
  readonly process: PtyLikeProcess;
  emitData(data: string): void;
  emitExit(code: number): void;
} {
  let dataListener: ((data: string) => void) | null = null;
  let exitListener: ((event: { exitCode: number }) => void) | null = null;

  const process: PtyLikeProcess = {
    pid: 1,
    write: vi.fn(),
    resize: vi.fn(),
    kill: vi.fn(),
    onData(listener) {
      dataListener = listener;
    },
    onExit(listener) {
      exitListener = listener;
    },
  };

  return {
    process,
    pty: {
      spawn: vi.fn(() => process),
    },
    emitData(data) {
      dataListener?.(data);
    },
    emitExit(code) {
      exitListener?.({ exitCode: code });
    },
  };
}

describe('NodePtyTerminalManager', () => {
  it('creates sessions and forwards data', () => {
    const mock = createPtyMock();
    const data = vi.fn();
    const manager = new NodePtyTerminalManager(mock.pty, {
      onData: data,
      onStatus: vi.fn(),
      onExit: vi.fn(),
    });

    const session = manager.createSession({
      title: 'shell',
      cwd: '/repo',
      runtime: 'electron',
    });

    mock.emitData('hello');

    expect(session.status).toBe('running');
    expect(data).toHaveBeenCalledWith(expect.objectContaining({ sessionId: session.id, data: 'hello' }));
  });

  it('runs actions by writing the command', () => {
    const mock = createPtyMock();
    const manager = new NodePtyTerminalManager(mock.pty, {
      onData: vi.fn(),
      onStatus: vi.fn(),
      onExit: vi.fn(),
    });

    manager.runAction({
      actionId: 'dev',
      title: 'dev',
      command: 'pnpm dev',
      cwd: '/repo',
      runtime: 'electron',
    });

    expect(mock.process.write).toHaveBeenCalledWith(expect.stringContaining('pnpm dev'));
  });
});
