export interface ProjectZipMergePolicy {
    readonly canonicalBase: string;
    readonly secondarySource: string;
    readonly preserveUniqueFiles: boolean;
    readonly archiveImportantConflicts: boolean;
    readonly removeJunkPatterns: readonly string[];
}

/**
 * Describes the merge policy used when two ZIPs from the same project are supplied.
 *
 * @returns The current project merge policy.
 *
 * @example
 * ```ts
 * getProjectZipMergePolicy().canonicalBase
 * // "latest functional ZIP"
 * ```
 */
export function getProjectZipMergePolicy(): ProjectZipMergePolicy {
    return {
        canonicalBase: 'latest functional ZIP',
        secondarySource: 'older ZIP with potentially useful missing features',
        preserveUniqueFiles: true,
        archiveImportantConflicts: true,
        removeJunkPatterns: [
            'node_modules',
            '.git',
            '.turbo',
            '.nx',
            'dist',
            'build',
            'coverage',
            '.next',
            '*.log',
            '*.tmp',
            '*.cache',
            '*.bak',
        ],
    };
}
