import type { LayoutState, RunRecord, TerminalTab } from '@/shared/types';

export interface WorkbenchHistoryStore {
  saveLayout(layout: LayoutState): void;
  readLayout(): LayoutState | null;
  saveRun(run: RunRecord): void;
  listRuns(limit: number): readonly RunRecord[];
  saveTerminalTab(tab: TerminalTab): void;
  listTerminalTabs(): readonly TerminalTab[];
}

/**
 * In-memory repository used by tests and Web mode fallback when SQLite is unavailable.
 *
 * @remarks
 * This mirrors the SQLite repository contract so renderer logic can be tested without native modules.
 *
 * @example
 * ```ts
 * const store = new MemoryWorkbenchHistoryStore();
 * store.saveRun(run);
 * store.listRuns(1)[0].id;
 * ```
 */
export class MemoryWorkbenchHistoryStore implements WorkbenchHistoryStore {
  private layout: LayoutState | null = null;
  private readonly runs = new Map<string, RunRecord>();
  private readonly tabs = new Map<string, TerminalTab>();

  /** @param layout - Layout sizes to persist. @returns Nothing. */
  public saveLayout(layout: LayoutState): void {
    this.layout = layout;
  }

  /** @returns The latest layout snapshot, when available. */
  public readLayout(): LayoutState | null {
    return this.layout;
  }

  /** @param run - Run record to persist. @returns Nothing. */
  public saveRun(run: RunRecord): void {
    this.runs.set(run.id, run);
  }

  /** @param limit - Maximum number of recent runs. @returns Recent runs first. */
  public listRuns(limit: number): readonly RunRecord[] {
    return Array.from(this.runs.values())
      .sort((left, right) => right.startedAtIso.localeCompare(left.startedAtIso))
      .slice(0, Math.max(0, limit));
  }

  /** @param tab - Terminal tab snapshot to persist. @returns Nothing. */
  public saveTerminalTab(tab: TerminalTab): void {
    this.tabs.set(tab.id, tab);
  }

  /** @returns Persisted terminal tabs sorted by creation date descending. */
  public listTerminalTabs(): readonly TerminalTab[] {
    return Array.from(this.tabs.values()).sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso));
  }
}
