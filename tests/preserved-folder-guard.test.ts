import { describe, expect, it } from 'vitest';
import { detectPreservedFolderViolations } from '../src/shared/cleanup/preserved-folder-guard';

describe('preserved folder guard', () => {
  it('detects preserved legacy folders', () => {
    const violations = detectPreservedFolderViolations([
      'src/core/index.ts',
      'preserved-v10/src/core/module_0.ts',
    ]);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.path).toContain('preserved-v10');
  });
});
