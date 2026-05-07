import { describe, expect, it, vi } from 'vitest';
import { migrateRuntimeSQLiteDatabase } from '../src/main/persistence/runtime-sqlite-database';

describe('migrateRuntimeSQLiteDatabase', () => {
  it('creates runtime tables and indexes', () => {
    const exec = vi.fn();
    migrateRuntimeSQLiteDatabase({ exec } as never);

    const sql = exec.mock.calls[0]?.[0] as string;
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS runtime_runs');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS runtime_events');
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_runtime_events_run_id');
  });
});
