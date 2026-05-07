import { describe, expect, it } from 'vitest';
import { createOpenTarget } from '../src/shared/openers/open-targets';

describe('createOpenTarget', () => {
  it('maps URLs to browser targets', () => {
    const target = createOpenTarget({
      type: 'url',
      value: 'https://example.com',
      line: null,
      column: null,
    });

    expect(target.kind).toBe('browser');
  });

  it('maps files to editor targets', () => {
    const target = createOpenTarget({
      type: 'file',
      value: 'src/index.ts',
      line: 10,
      column: 2,
    });

    expect(target.kind).toBe('editor');
    expect(target.line).toBe(10);
  });
});
