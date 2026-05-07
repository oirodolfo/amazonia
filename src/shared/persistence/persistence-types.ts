import type { TerminalSessionSnapshot } from '@/shared/runtime/runtime-types';

export interface PersistedWorkbenchState {
  readonly actionFrequencies: Readonly<Record<string, number>>;
  readonly favoriteActionIds: readonly string[];
  readonly pinnedPackageIds: readonly string[];
  readonly layout: Readonly<Record<string, unknown>>;
  readonly terminalSessions: readonly TerminalSessionSnapshot[];
}

export const emptyPersistedWorkbenchState: PersistedWorkbenchState = {
  actionFrequencies: {},
  favoriteActionIds: [],
  pinnedPackageIds: [],
  layout: {},
  terminalSessions: [],
};

/**
 * Normalizes unknown JSON into a persisted workbench state.
 *
 * @param value - Unknown persisted value.
 * @returns Safe persisted workbench state.
 *
 * @example
 * ```ts
 * normalizePersistedWorkbenchState(JSON.parse(raw))
 * ```
 */
export function normalizePersistedWorkbenchState(value: unknown): PersistedWorkbenchState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyPersistedWorkbenchState;
  }

  const candidate = value as Partial<PersistedWorkbenchState>;

  return {
    actionFrequencies: isRecord(candidate.actionFrequencies) ? candidate.actionFrequencies : {},
    favoriteActionIds: Array.isArray(candidate.favoriteActionIds) ? candidate.favoriteActionIds : [],
    pinnedPackageIds: Array.isArray(candidate.pinnedPackageIds) ? candidate.pinnedPackageIds : [],
    layout: isRecord(candidate.layout) ? candidate.layout : {},
    terminalSessions: Array.isArray(candidate.terminalSessions) ? candidate.terminalSessions : [],
  };
}

function isRecord(value: unknown): value is Record<string, never> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
