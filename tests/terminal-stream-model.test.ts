import { describe, expect, it } from 'vitest';
import {
  appendTerminalStreamFrame,
  createTerminalStreamFrame,
} from '../src/shared/terminal/terminal-stream-model';

describe('terminal stream model', () => {
  it('creates semantic frames from raw terminal output', () => {
    const frame = createTerminalStreamFrame({
      sessionId: 'term-1',
      raw: 'error src/index.ts\n',
      receivedAt: 1,
    });

    expect(frame.lines).toEqual(['error src/index.ts']);
    expect(frame.tokens.some((token) => token.type === 'error')).toBe(true);
    expect(frame.sections.length).toBeGreaterThan(0);
  });

  it('keeps frame history bounded', () => {
    const frame = createTerminalStreamFrame({
      sessionId: 'term-1',
      raw: 'ok',
      receivedAt: 1,
    });

    expect(appendTerminalStreamFrame([frame, frame], frame, 2)).toHaveLength(2);
  });
});
