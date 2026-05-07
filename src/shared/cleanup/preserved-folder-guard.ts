export interface PreservedFolderViolation {
  readonly path: string;
  readonly reason: string;
}

/**
 * Detects preserved legacy folders that should not ship in production artifacts.
 *
 * @param paths - Repository-relative paths.
 * @returns Preserved folder violations.
 *
 * @example
 * ```ts
 * detectPreservedFolderViolations(['src/core/index.ts', 'preserved-v10/package.json'])
 * ```
 */
export function detectPreservedFolderViolations(
  paths: readonly string[],
): PreservedFolderViolation[] {
  return paths
    .filter((path) => path.split(/[\\/]/u).some((part) => /^preserved-v\d+$/iu.test(part)))
    .map((path) => ({
      path,
      reason: 'Legacy preserved folders must be migrated into src/tests/docs or removed before release.',
    }));
}
