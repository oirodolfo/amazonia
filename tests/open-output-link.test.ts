import { describe, expect, it, vi } from 'vitest';
import { openFriendlyOutputLink } from '../src/renderer/output/open-output-link';

describe('openFriendlyOutputLink', () => {
  it('maps output links to opener targets', async () => {
    const openTarget = vi.fn(async () => true);

    await openFriendlyOutputLink({ openTarget }, {
      type: 'file',
      value: 'src/index.ts',
      line: 10,
      column: 2,
    });

    expect(openTarget).toHaveBeenCalledWith({
      kind: 'editor',
      value: 'src/index.ts',
      line: 10,
      column: 2,
    });
  });
});
