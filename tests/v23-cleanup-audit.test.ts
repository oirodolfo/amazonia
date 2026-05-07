import { describe, expect, it } from 'vitest';
import { createCleanupAuditReport, selectCleanupIssuesBySeverity } from '../src/shared/cleanup/v23-cleanup-audit';

describe('v23 cleanup audit', () => {
  it('normalizes and filters cleanup issues', () => {
    const report = createCleanupAuditReport({
      version: 'v23',
      generatedAt: 1,
      removedJunk: ['dist'],
      duplicateGroups: [['a', 'b']],
      issues: [{
        id: 'single-file-folder',
        severity: 'warning',
        title: 'Single file folder',
        path: 'src/foo',
        recommendation: 'Move with import rewrite.',
      }],
    });

    expect(report.removedJunk).toEqual(['dist']);
    expect(selectCleanupIssuesBySeverity(report, 'warning')).toHaveLength(1);
  });
});
