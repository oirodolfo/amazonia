import { describe, expect, it } from 'vitest';
import {
  appendTerminalScrollbackChunk,
  createTerminalScrollbackStore,
} from '../src/shared/terminal/terminal-scrollback-store';

describe('terminal scrollback store', () => {
  it('stores bounded scrollback chunks', () => {
    const store = createTerminalScrollbackStore();
    const next = appendTerminalScrollbackChunk(store, {
      id: 'chunk',
      sessionId: 'term',
      lines: ['hello'],
      createdAt: 1,
    });

    expect(next.chunks).toHaveLength(1);
  });
});
