import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const workbenchKv = sqliteTable('workbench_kv', {
    key: text('key').primaryKey(),
    value: text('value', {mode: 'json'}).notNull(),
    updatedAt: integer('updated_at').notNull(),
});

export const actionRuns = sqliteTable('action_runs', {
    id: text('id').primaryKey(),
    actionId: text('action_id').notNull(),
    command: text('command').notNull(),
    cwd: text('cwd').notNull(),
    status: text('status').notNull(),
    startedAt: integer('started_at').notNull(),
    finishedAt: integer('finished_at'),
    exitCode: integer('exit_code'),
});

export const terminalTabs = sqliteTable('terminal_tabs', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    cwd: text('cwd').notNull(),
    command: text('command'),
    runtime: text('runtime').notNull(),
    status: text('status').notNull(),
    cols: integer('cols').notNull(),
    rows: integer('rows').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    exitCode: integer('exit_code'),
});
