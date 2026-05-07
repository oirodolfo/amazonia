export interface CleanupAuditIssue {
  readonly id: string;
  readonly severity: 'info' | 'warning' | 'error';
  readonly title: string;
  readonly path: string;
  readonly recommendation: string;
}

export interface CleanupAuditReport {
  readonly version: string;
  readonly generatedAt: number;
  readonly issues: readonly CleanupAuditIssue[];
  readonly removedJunk: readonly string[];
  readonly duplicateGroups: readonly (readonly string[])[];
}

/**
 * Creates a normalized cleanup audit report.
 *
 * @param input - Audit report data.
 * @returns Normalized cleanup audit report.
 *
 * @example
 * ```ts
 * createCleanupAuditReport({
 *   version: 'v23',
 *   generatedAt: 1,
 *   issues: [],
 *   removedJunk: [],
 *   duplicateGroups: [],
 * })
 * ```
 */
export function createCleanupAuditReport(input: CleanupAuditReport): CleanupAuditReport {
  return {
    version: input.version,
    generatedAt: input.generatedAt,
    issues: [...input.issues],
    removedJunk: [...input.removedJunk],
    duplicateGroups: input.duplicateGroups.map((group) => [...group]),
  };
}

/**
 * Filters cleanup issues by severity without mutating the report.
 *
 * @param report - Cleanup audit report.
 * @param severity - Severity to select.
 * @returns Matching cleanup issues.
 *
 * @example
 * ```ts
 * selectCleanupIssuesBySeverity(report, 'warning')
 * ```
 */
export function selectCleanupIssuesBySeverity(
  report: CleanupAuditReport,
  severity: CleanupAuditIssue['severity'],
): CleanupAuditIssue[] {
  return report.issues.filter((issue) => issue.severity === severity);
}
