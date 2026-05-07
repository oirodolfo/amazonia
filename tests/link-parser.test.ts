import { describe, expect, it } from 'vitest';
import { parseOutputLinks } from '../src/output/link-parser';

describe('parseOutputLinks', () => {
  it('extracts URLs and source locations', () => {
    const links = parseOutputLinks('see https://example.com and src/app.ts:12:4 error', '/repo');

    expect(links).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'url', target: 'https://example.com' }),
      expect.objectContaining({ kind: 'file', target: expect.stringContaining('src/app.ts'), line: 12, column: 4 }),
    ]));
  });
});
