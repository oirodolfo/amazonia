import { describe, expect, it } from 'vitest';
import { createEditorOpenCommand } from '../src/shared/openers/editor-open-command';

describe('createEditorOpenCommand', () => {
  it('builds editor open command with line and column', () => {
    const command = createEditorOpenCommand({
      file: 'src/index.ts',
      line: 10,
      column: 2,
    }, 'code');

    expect(command?.args).toEqual(['-g', 'src/index.ts:10:2']);
  });
});
