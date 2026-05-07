import type { WorkspaceAction, WorkspaceManifest, WorkspacePackage } from '@/shared/types';

export interface ActionIndexEntry {
  readonly action: WorkspaceAction;
  readonly package: WorkspacePackage | null;
  readonly searchableText: string;
  readonly tokens: readonly string[];
}

export interface RankedActionMatch {
  readonly entry: ActionIndexEntry;
  readonly score: number;
  readonly reasons: readonly string[];
}

const TOKEN_SPLIT_REGEX = /[^a-z0-9@/_:.-]+/iu;
const EXACT_MATCH_SCORE = 120;
const PREFIX_MATCH_SCORE = 72;
const INCLUDES_MATCH_SCORE = 36;
const KIND_MATCH_SCORE = 18;
const FREQUENCY_WEIGHT_MULTIPLIER = 0.15;

/**
 * Builds a deterministic action search index for command palettes, sidebars and package hover cards.
 *
 * @remarks
 * This replaces scattered `filter().includes()` calls with one reusable index that understands package names,
 * script labels, command text and action kind. The index is intentionally plain data so it can run in Electron,
 * Web mode, tests and future workers without runtime coupling.
 *
 * @param workspace - Workspace manifest produced by the scanner.
 * @returns Search entries sorted in the same order as the workspace actions.
 *
 * @example
 * ```ts
 * const index = createActionIndex(workspace);
 * const matches = searchActionIndex(index, 'api test');
 * matches[0]?.entry.action.command;
 * ```
 */
export function createActionIndex(workspace: WorkspaceManifest): readonly ActionIndexEntry[] {
  const packagesById = new Map(workspace.packages.map((workspacePackage) => [workspacePackage.id, workspacePackage] as const));

  return workspace.actions.map((action) => {
    const workspacePackage = packagesById.get(action.packageId) ?? null;
    const searchableText = [
      action.label,
      action.command,
      action.kind,
      action.packageName,
      workspacePackage?.relativePath,
      action.description,
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .toLowerCase();

    return Object.freeze({
      action,
      package: workspacePackage,
      searchableText,
      tokens: tokenize(searchableText),
    });
  });
}

/**
 * Searches the action index and ranks matches using exact, prefix, fuzzy includes and usage weight signals.
 *
 * @param index - Entries created by `createActionIndex`.
 * @param query - Human search query from the command palette or sidebar search.
 * @param limit - Maximum number of matches to return.
 * @returns Ranked matches, highest score first.
 *
 * @example
 * ```ts
 * const matches = searchActionIndex(index, 'turbo build', 5);
 * matches.map((match) => match.entry.action.label);
 * ```
 */
export function searchActionIndex(index: readonly ActionIndexEntry[], query: string, limit = 20): readonly RankedActionMatch[] {
  const queryTokens = tokenize(query.toLowerCase());
  if (queryTokens.length === 0) {
    return index
      .map((entry) => ({ entry, score: entry.action.weight, reasons: ['default-weight'] }))
      .sort(sortMatches)
      .slice(0, Math.max(0, limit));
  }

  return index
    .map((entry) => scoreEntry(entry, queryTokens))
    .filter((match): match is RankedActionMatch => match !== null)
    .sort(sortMatches)
    .slice(0, Math.max(0, limit));
}

/**
 * Groups index entries by package so hover cards can reuse the same ranking model as command palette search.
 *
 * @param index - Entries created by `createActionIndex`.
 * @returns A map keyed by package id.
 *
 * @example
 * ```ts
 * const grouped = groupActionIndexByPackage(index);
 * grouped.get(packageId)?.map((entry) => entry.action.label);
 * ```
 */
export function groupActionIndexByPackage(index: readonly ActionIndexEntry[]): ReadonlyMap<string, readonly ActionIndexEntry[]> {
  const grouped = new Map<string, ActionIndexEntry[]>();

  for (const entry of index) {
    const current = grouped.get(entry.action.packageId) ?? [];
    current.push(entry);
    grouped.set(entry.action.packageId, current);
  }

  for (const [packageId, entries] of grouped) {
    grouped.set(packageId, entries.sort((left, right) => right.action.weight - left.action.weight || left.action.label.localeCompare(right.action.label)));
  }

  return grouped;
}

function scoreEntry(entry: ActionIndexEntry, queryTokens: readonly string[]): RankedActionMatch | null {
  let score = entry.action.weight * FREQUENCY_WEIGHT_MULTIPLIER;
  const reasons: string[] = [];

  for (const token of queryTokens) {
    if (entry.tokens.includes(token)) {
      score += EXACT_MATCH_SCORE;
      reasons.push(`exact:${token}`);
      continue;
    }

    if (entry.tokens.some((entryToken) => entryToken.startsWith(token))) {
      score += PREFIX_MATCH_SCORE;
      reasons.push(`prefix:${token}`);
      continue;
    }

    if (entry.searchableText.includes(token)) {
      score += INCLUDES_MATCH_SCORE;
      reasons.push(`includes:${token}`);
      continue;
    }

    return null;
  }

  if (queryTokens.includes(entry.action.kind)) {
    score += KIND_MATCH_SCORE;
    reasons.push(`kind:${entry.action.kind}`);
  }

  return { entry, score, reasons };
}

function tokenize(input: string): readonly string[] {
  return input
    .split(TOKEN_SPLIT_REGEX)
    .map((token) => token.trim().toLowerCase())
    .filter((token, index, tokens) => token.length > 0 && tokens.indexOf(token) === index);
}

function sortMatches(left: RankedActionMatch, right: RankedActionMatch): number {
  return right.score - left.score || left.entry.action.packageName.localeCompare(right.entry.action.packageName) || left.entry.action.label.localeCompare(right.entry.action.label);
}
