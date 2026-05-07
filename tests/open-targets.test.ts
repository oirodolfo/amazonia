import { describe, expect, it } from 'vitest';
import { createOpenTarget } from '../src/shared/openers/open-targets';

describe('createOpenTarget', () => {
  it('maps URLs to browser targets', () => {
    const target = createOpenTarget({
      kind: 'url',
      raw: 'https://example.com',
      target: 'https://example.com',
    });

    expect(target.kind).toBe('browser');
    expect(target.value).toBe('https://example.com');
  });

  it('maps files to editor targets', () => {
    const target = createOpenTarget({
      kind: 'file',
      raw: 'src/index.ts:10:2',
      target: 'src/index.ts',
      line: 10,
      column: 2,
    });

    expect(target.kind).toBe('editor');
    expect(target.line).toBe(10);
    expect(target.column).toBe(2);
  });
});
