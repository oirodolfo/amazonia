import type { LayoutState } from '@/shared/types';

export interface LayoutHistoryEntry {
  readonly layout: LayoutState;
  readonly savedAtIso: string;
  readonly source: 'resize' | 'restore' | 'reset';
}

const DEFAULT_LAYOUT: LayoutState = Object.freeze({ sidebarSize: 22, terminalSize: 52, outputSize: 26 });
const LAYOUT_TOTAL = 100;
const MIN_PANEL_SIZE = 8;

/**
 * Normalizes persisted panel sizes so corrupted state cannot break the workbench layout.
 *
 * @param layout - Raw layout state loaded from persistence or panel resize events.
 * @returns A safe layout whose values sum to 100.
 *
 * @example
 * ```ts
 * normalizeLayoutState({ sidebarSize: 1, terminalSize: 1, outputSize: 1 });
 * ```
 */
export function normalizeLayoutState(layout: LayoutState | null | undefined): LayoutState {
  if (layout === null || layout === undefined) return DEFAULT_LAYOUT;

  const sidebarSize = sanitizeSize(layout.sidebarSize);
  const terminalSize = sanitizeSize(layout.terminalSize);
  const outputSize = sanitizeSize(layout.outputSize);
  const total = sidebarSize + terminalSize + outputSize;

  if (total <= 0) return DEFAULT_LAYOUT;

  return Object.freeze({
    sidebarSize: roundPanelSize((sidebarSize / total) * LAYOUT_TOTAL),
    terminalSize: roundPanelSize((terminalSize / total) * LAYOUT_TOTAL),
    outputSize: roundPanelSize((outputSize / total) * LAYOUT_TOTAL),
  });
}

/**
 * Appends a bounded layout history entry for local analytics and debugging.
 *
 * @param history - Previous layout history entries.
 * @param layout - New layout state.
 * @param source - Why the layout changed.
 * @param limit - Maximum number of entries to keep.
 * @returns A new bounded history array.
 *
 * @example
 * ```ts
 * const history = appendLayoutHistory([], layout, 'resize');
 * history[0]?.source;
 * ```
 */
export function appendLayoutHistory(
  history: readonly LayoutHistoryEntry[],
  layout: LayoutState,
  source: LayoutHistoryEntry['source'],
  limit = 50,
): readonly LayoutHistoryEntry[] {
  const entry: LayoutHistoryEntry = Object.freeze({ layout: normalizeLayoutState(layout), source, savedAtIso: new Date().toISOString() });
  return [entry, ...history].slice(0, Math.max(1, limit));
}

function sanitizeSize(value: number): number {
  return Number.isFinite(value) ? Math.max(MIN_PANEL_SIZE, value) : MIN_PANEL_SIZE;
}

function roundPanelSize(value: number): number {
  return Math.round(value * 100) / 100;
}
