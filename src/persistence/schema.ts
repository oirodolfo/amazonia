import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const layoutTable = sqliteTable('layout_state', {
  id: text('id').primaryKey(),
  payload: text('payload').notNull(),
  updatedAtIso: text('updated_at_iso').notNull(),
});

export const runsTable = sqliteTable('runs', {
  id: text('id').primaryKey(),
  actionId: text('action_id').notNull(),
  command: text('command').notNull(),
  cwd: text('cwd').notNull(),
  startedAtIso: text('started_at_iso').notNull(),
  endedAtIso: text('ended_at_iso'),
  durationMs: integer('duration_ms'),
  exitCode: integer('exit_code'),
  status: text('status').notNull(),
});

export const usageWeightsTable = sqliteTable('usage_weights', {
  actionId: text('action_id').primaryKey(),
  weight: integer('weight').notNull(),
  updatedAtIso: text('updated_at_iso').notNull(),
});
