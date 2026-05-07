import type { ActionableDiagnostic } from './actionable-diagnostic-types';
import { mapCommonErrorToDiagnostic } from './common-error-patterns';

/**
 * Maps output lines into actionable diagnostics and removes duplicate ids.
 *
 * @param lines - Terminal output lines.
 * @returns Actionable diagnostics.
 *
 * @example
 * ```ts
 * createActionableDiagnostics(['src/index.ts:1:1 error TS2304'])
 * ```
 */
export function createActionableDiagnostics(
  lines: readonly string[],
): ActionableDiagnostic[] {
  const seen = new Set<string>();
  const diagnostics: ActionableDiagnostic[] = [];

  for (const line of lines) {
    const diagnostic = mapCommonErrorToDiagnostic(line);

    if (!diagnostic || seen.has(diagnostic.id)) {
      continue;
    }

    seen.add(diagnostic.id);
    diagnostics.push(diagnostic);
  }

  return diagnostics;
}
