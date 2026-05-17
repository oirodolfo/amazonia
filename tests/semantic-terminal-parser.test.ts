import { describe, expect, it } from 'vitest';
import { parseSemanticTerminalLine } from '../src/shared/terminal/semantic-terminal-parser';

describe('semantic terminal parser', () => {
  it('extracts semantic tokens', () => {
    const tokens = parseSemanticTerminalLine(
      'error src/index.ts https://example.com',
    );

    expect(tokens.some((token) => token.severity === 'error')).toBe(true);
    expect(tokens.some((token) => token.type === 'url')).toBe(true);
    expect(tokens.some((token) => token.type === 'file')).toBe(true);
  });
});
