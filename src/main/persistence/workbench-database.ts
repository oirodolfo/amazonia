import path from 'node:path';
import Database from 'better-sqlite3';
import {type BetterSQLite3Database, drizzle} from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export interface WorkbenchDatabase {
    readonly sqlite: Database.Database;
    readonly db: BetterSQLite3Database<typeof schema>;
}

/**
 * Opens the workbench SQLite database and prepares the minimal schema.
 *
 * @param databasePath - Absolute or relative SQLite database path.
 * @returns Database handles for raw SQLite and Drizzle.
 *
 * @example
 * ```ts
 * const database = openWorkbenchDatabase('./.amazonia/workbench.sqlite')
 * ```
 */
export function openWorkbenchDatabase(databasePath: string): WorkbenchDatabase {
    const resolvedPath = path.resolve(databasePath);
    const sqlite = new Database(resolvedPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    migrateWorkbenchDatabase(sqlite);

    return {
        sqlite,
        db: drizzle(sqlite, {schema}),
    };
}

/**
 * Applies the hand-written bootstrap migration.
 *
 * @param sqlite - SQLite database handle.
 * @returns Nothing.
 *
 * @example
 * ```ts
 * migrateWorkbenchDatabase(sqlite)
 * ```
 */
export function migrateWorkbenchDatabase(sqlite: Database.Database): void {
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS workbench_kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS action_runs (
      id TEXT PRIMARY KEY,
      action_id TEXT NOT NULL,
      command TEXT NOT NULL,
      cwd TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      exit_code INTEGER
    );

    CREATE TABLE IF NOT EXISTS terminal_tabs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      cwd TEXT NOT NULL,
      command TEXT,
      runtime TEXT NOT NULL,
      status TEXT NOT NULL,
      cols INTEGER NOT NULL,
      rows INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      exit_code INTEGER
    );
  `);
}
