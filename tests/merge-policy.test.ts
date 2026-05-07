import { describe, expect, it } from 'vitest';
import { getProjectZipMergePolicy } from '../src/shared/merge/merge-policy';

describe('getProjectZipMergePolicy', () => {
  it('documents the incremental ZIP merge behavior', () => {
    const policy = getProjectZipMergePolicy();

    expect(policy.preserveUniqueFiles).toBe(true);
    expect(policy.archiveImportantConflicts).toBe(true);
    expect(policy.removeJunkPatterns).toContain('node_modules');
  });
});
