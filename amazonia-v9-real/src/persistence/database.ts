import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import type { LayoutState, RunRecord } from '@/shared/types';
import { DEFAULT_LAYOUT } from '@/shared/protocol';
import { layoutTable, runsTable, usageWeightsTable } from './schema';

export interface WorkbenchDatabase {
  readLayout(): LayoutState;
  writeLayout(layout: LayoutState): void;
  recordRun(run: RunRecord): void;
  incrementActionWeight(actionId: string): void;
  readActionWeights(): Readonly<Record<string, number>>;
}

/**
 * Opens the local SQLite database used by Curupira Workbench.
 *
 * @param databasePath - File path for the SQLite database.
 * @returns An isolated persistence adapter.
 *
 * @example
 * ```ts
 * const db = createWorkbenchDatabase('/tmp/amazonia.sqlite');
 * db.writeLayout({ sidebarSize: 20, terminalSize: 50, outputSize: 30 });
 * ```
 */
export function createWorkbenchDatabase(databasePath: string): WorkbenchDatabase {
  const sqlite = new Database(databasePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS layout_state (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at_iso TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, action_id TEXT NOT NULL, command TEXT NOT NULL, cwd TEXT NOT NULL, started_at_iso TEXT NOT NULL, ended_at_iso TEXT, duration_ms INTEGER, exit_code INTEGER, status TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS usage_weights (action_id TEXT PRIMARY KEY, weight INTEGER NOT NULL, updated_at_iso TEXT NOT NULL);
  `);
  const db = drizzle(sqlite);

  return {
    readLayout(): LayoutState {
      const row = db.select().from(layoutTable).where(eq(layoutTable.id, 'default')).get();
      return row === undefined ? DEFAULT_LAYOUT : JSON.parse(row.payload) as LayoutState;
    },
    writeLayout(layout: LayoutState): void {
      db.insert(layoutTable).values({ id: 'default', payload: JSON.stringify(layout), updatedAtIso: new Date().toISOString() }).onConflictDoUpdate({
        target: layoutTable.id,
        set: { payload: JSON.stringify(layout), updatedAtIso: new Date().toISOString() },
      }).run();
    },
    recordRun(run: RunRecord): void {
      db.insert(runsTable).values({
        id: run.id,
        actionId: run.actionId,
        command: run.command,
        cwd: run.cwd,
        startedAtIso: run.startedAtIso,
        endedAtIso: run.endedAtIso,
        durationMs: run.durationMs,
        exitCode: run.exitCode,
        status: run.status,
      }).onConflictDoNothing().run();
    },
    incrementActionWeight(actionId: string): void {
      const current = db.select().from(usageWeightsTable).where(eq(usageWeightsTable.actionId, actionId)).get();
      const nextWeight = (current?.weight ?? 0) + 1;
      db.insert(usageWeightsTable).values({ actionId, weight: nextWeight, updatedAtIso: new Date().toISOString() }).onConflictDoUpdate({
        target: usageWeightsTable.actionId,
        set: { weight: nextWeight, updatedAtIso: new Date().toISOString() },
      }).run();
    },
    readActionWeights(): Readonly<Record<string, number>> {
      return Object.fromEntries(db.select().from(usageWeightsTable).all().map((row) => [row.actionId, row.weight]));
    },
  };
}
