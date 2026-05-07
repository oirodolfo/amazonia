import type { FriendlyOutputCard, OutputDiagnostic, RunRecord } from '@/shared/types';
import { parseOutputLinks } from './link-parser';

const URL_PATTERN = /https?:\/\/[^\s)]+/gu;
const FILE_PATTERN = /(?<file>(?:[A-Za-z]:)?[^\s:]+\.(?:ts|tsx|js|jsx|json|md|css|scss|html|go|rs|py))(?::(?<line>\d+))?(?::(?<column>\d+))?/gu;
const WARNING_PATTERN = /\b(warn|warning|deprecated)\b/iu;
const ERROR_PATTERN = /\b(error|failed|exception|enoent|typeerror|syntaxerror)\b/iu;

/**
 * Parses terminal output into friendly diagnostics and clickable links.
 *
 * @param run - Run metadata used to label the output card.
 * @param chunks - Terminal output chunks captured during the run.
 * @returns A friendly output card for the side panel.
 *
 * @example
 * ```ts
 * const card = parseFriendlyOutput(run, ['src/app.ts:10:2 error']);
 * card.diagnostics[0]?.level // 'error'
 * ```
 */
export function parseFriendlyOutput(run: RunRecord, chunks: readonly string[]): FriendlyOutputCard {
  const output = chunks.join('');
  const links = parseOutputLinks(output, run.cwd).map((link) => link.raw);
  const diagnostics = parseDiagnostics(output);

  return {
    id: `card:${run.id}`,
    runId: run.id,
    command: run.command,
    cwd: run.cwd,
    status: run.status,
    durationMs: run.durationMs,
    exitCode: run.exitCode,
    diagnostics,
    links,
  };
}

/**
 * Extracts line-level diagnostics from raw terminal text.
 *
 * @param output - Raw terminal output.
 * @returns Normalized diagnostics with optional file locations.
 *
 * @example
 * ```ts
 * parseDiagnostics('warning src/a.ts:1').at(0)?.level // 'warning'
 * ```
 */
export function parseDiagnostics(output: string): readonly OutputDiagnostic[] {
  return output
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const level = ERROR_PATTERN.test(line) ? 'error' : WARNING_PATTERN.test(line) ? 'warning' : null;
      if (level === null) return [];
      const fileMatch = [...line.matchAll(FILE_PATTERN)][0];
      return [{
        level,
        message: line,
        filePath: fileMatch?.groups?.file,
        line: fileMatch?.groups?.line === undefined ? undefined : Number(fileMatch.groups.line),
        column: fileMatch?.groups?.column === undefined ? undefined : Number(fileMatch.groups.column),
      } satisfies OutputDiagnostic];
    });
}
