import { describe, expect, it } from 'vitest';
import { createCleanupReport } from '../src/shared/cleanup/cleanup-report';

describe('createCleanupReport', () => {
  it('creates immutable-looking cleanup metadata', () => {
    const report = createCleanupReport({
      version: 'v17',
      duplicateGroups: [],
      removedJunkPatterns: ['node_modules'],
      notes: ['cleanup'],
    });

    expect(report.version).toBe('v17');
    expect(report.removedJunkPatterns).toContain('node_modules');
  });
});
