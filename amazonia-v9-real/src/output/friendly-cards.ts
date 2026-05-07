import type { FriendlyOutputCard, RunRecord } from '@/shared/types';
import { parseOutputLinks } from './link-parser';
import { parseToolOutput } from './suite-parsers';

/**
 * Builds a richer friendly output card from terminal output and run metadata.
 *
 * @param run - Finished or running action record.
 * @param chunks - Raw terminal chunks captured for the run.
 * @returns A friendly output card with diagnostics, links and status metadata.
 *
 * @example
 * ```ts
 * createFriendlyOutputCard(run, ['src/a.ts:1:1 error']).diagnostics.length;
 * ```
 */
export function createFriendlyOutputCard(run: RunRecord, chunks: readonly string[]): FriendlyOutputCard {
  const raw = chunks.join('');
  const parsed = parseToolOutput(raw);
  const links = parseOutputLinks(raw, run.cwd).map((link) => link.raw);

  return {
    id: `card-${run.id}`,
    runId: run.id,
    command: run.command,
    cwd: run.cwd,
    status: run.status,
    durationMs: run.durationMs,
    exitCode: run.exitCode,
    diagnostics: parsed.diagnostics,
    links,
  };
}
