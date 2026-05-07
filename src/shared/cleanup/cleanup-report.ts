export interface CleanupDuplicateGroup {
    readonly hash: string;
    readonly kept: string;
    readonly archived: readonly string[];
}

export interface CleanupReport {
    readonly version: string;
    readonly duplicateGroups: readonly CleanupDuplicateGroup[];
    readonly removedJunkPatterns: readonly string[];
    readonly notes: readonly string[];
}

/**
 * Creates a structured cleanup report for release validation.
 *
 * @param input - Cleanup report fields.
 * @returns Immutable cleanup report.
 *
 * @example
 * ```ts
 * createCleanupReport({
 *   version: 'v17',
 *   duplicateGroups: [],
 *   removedJunkPatterns: ['node_modules'],
 *   notes: ['Kept latest functional files'],
 * })
 * ```
 */
export function createCleanupReport(input: CleanupReport): CleanupReport {
    return {
        version: input.version,
        duplicateGroups: [...input.duplicateGroups],
        removedJunkPatterns: [...input.removedJunkPatterns],
        notes: [...input.notes],
    };
}
