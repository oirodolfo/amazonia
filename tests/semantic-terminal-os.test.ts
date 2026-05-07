import { describe, expect, it } from 'vitest';
import { createSemanticTerminalSnapshot } from '../src/shared/terminal/semantic-terminal-os';

describe('semantic terminal os', () => {
  it('detects terminal markers', () => {
    const snapshot = createSemanticTerminalSnapshot(`
Error: boom
at src/index.ts:10
https://example.com
`);

    expect(snapshot.markers.some((marker) => marker.type === 'error')).toBe(true);
    expect(snapshot.markers.some((marker) => marker.type === 'url')).toBe(true);
  });
});
