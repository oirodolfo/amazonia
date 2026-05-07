import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as runtimeSchema from './runtime-sqlite-schema';

export interface RuntimeSQLiteDatabase {
  readonly sqlite: Database.Database;
  readonly db: BetterSQLite3Database<typeof runtimeSchema>;
}

/**
 * Opens the real runtime SQLite database and ensures runtime tables exist.
 *
 * @param databasePath - SQLite database path.
 * @returns Runtime SQLite database handles.
 *
 * @example
 * ```ts
 * const runtimeDb = openRuntimeSQLiteDatabase('./.amazonia/runtime.sqlite')
 * ```
 */
export function openRuntimeSQLiteDatabase(databasePath: string): RuntimeSQLiteDatabase {
  const resolvedPath = path.resolve(databasePath);
  const sqlite = new Database(resolvedPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  migrateRuntimeSQLiteDatabase(sqlite);

  return {
    sqlite,
    db: drizzle(sqlite, { schema: runtimeSchema }),
  };
}

/**
 * Applies runtime migrations using a small bootstrap migration.
 *
 * @param sqlite - Raw SQLite handle.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * migrateRuntimeSQLiteDatabase(sqlite)
 * ```
 */
export function migrateRuntimeSQLiteDatabase(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS runtime_runs (
      id TEXT PRIMARY KEY,
      command TEXT NOT NULL,
      cwd TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      exit_code INTEGER
    );

    CREATE TABLE IF NOT EXISTS runtime_events (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_runtime_events_run_id ON runtime_events(run_id);
    CREATE INDEX IF NOT EXISTS idx_runtime_events_type ON runtime_events(type);
    CREATE INDEX IF NOT EXISTS idx_runtime_events_timestamp ON runtime_events(timestamp);

    CREATE TABLE IF NOT EXISTS runtime_diagnostics (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      file TEXT,
      line INTEGER,
      column INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_runtime_diagnostics_run_id ON runtime_diagnostics(run_id);
    CREATE INDEX IF NOT EXISTS idx_runtime_diagnostics_severity ON runtime_diagnostics(severity);

    CREATE TABLE IF NOT EXISTS graph_snapshots (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      hash TEXT NOT NULL,
      graph TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_graph_snapshots_workspace_id ON graph_snapshots(workspace_id);

    CREATE TABLE IF NOT EXISTS terminal_sections (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      started_at_line INTEGER NOT NULL,
      ended_at_line INTEGER,
      lines TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_terminal_sections_session_id ON terminal_sections(session_id);
  `);
}
