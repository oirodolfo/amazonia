import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const runtimeRuns = sqliteTable('runtime_runs', {
  id: text('id').primaryKey(),
  command: text('command').notNull(),
  cwd: text('cwd').notNull(),
  status: text('status').notNull(),
  startedAt: integer('started_at').notNull(),
  finishedAt: integer('finished_at'),
  exitCode: integer('exit_code'),
});

export const runtimeEvents = sqliteTable('runtime_events', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull(),
  type: text('type').notNull(),
  timestamp: integer('timestamp').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
});

export const runtimeDiagnostics = sqliteTable('runtime_diagnostics', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull(),
  severity: text('severity').notNull(),
  message: text('message').notNull(),
  file: text('file'),
  line: integer('line'),
  column: integer('column'),
  createdAt: integer('created_at').notNull(),
});

export const graphSnapshots = sqliteTable('graph_snapshots', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  hash: text('hash').notNull(),
  graph: text('graph', { mode: 'json' }).notNull(),
  createdAt: integer('created_at').notNull(),
});

export const terminalSections = sqliteTable('terminal_sections', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  severity: text('severity').notNull(),
  startedAtLine: integer('started_at_line').notNull(),
  endedAtLine: integer('ended_at_line'),
  lines: text('lines', { mode: 'json' }).notNull(),
  createdAt: integer('created_at').notNull(),
});
