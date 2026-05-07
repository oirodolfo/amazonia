import {eq} from 'drizzle-orm';
import type {RunSummary} from '@/shared/actions/action-types';
import {
    emptyPersistedWorkbenchState,
    normalizePersistedWorkbenchState,
    type PersistedWorkbenchState,
} from '@/shared/persistence/persistence-types';
import type {TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';
import {actionRuns, terminalTabs, workbenchKv} from './schema';
import type {WorkbenchDatabase} from './workbench-database';

const STATE_KEY = 'workbench.state';

export interface WorkbenchRepository {
    loadState(): PersistedWorkbenchState;

    saveState(state: PersistedWorkbenchState): void;

    saveTerminalSession(session: TerminalSessionSnapshot): void;

    listTerminalSessions(): TerminalSessionSnapshot[];

    saveRun(run: RunSummary): void;
}

/**
 * Creates the SQLite-backed workbench repository.
 *
 * @param database - Open database handles.
 * @returns Repository for app persistence.
 *
 * @example
 * ```ts
 * const repo = createWorkbenchRepository(database)
 * repo.saveState(state)
 * ```
 */
export function createWorkbenchRepository(database: WorkbenchDatabase): WorkbenchRepository {
    return {
        loadState() {
            const row = database.db.select().from(workbenchKv).where(eq(workbenchKv.key, STATE_KEY)).get();
            if (!row) {
                return emptyPersistedWorkbenchState;
            }

            return normalizePersistedWorkbenchState(row.value);
        },

        saveState(state) {
            database.db
                .insert(workbenchKv)
                .values({
                    key: STATE_KEY,
                    value: state,
                    updatedAt: Date.now(),
                })
                .onConflictDoUpdate({
                    target: workbenchKv.key,
                    set: {
                        value: state,
                        updatedAt: Date.now(),
                    },
                })
                .run();
        },

        saveTerminalSession(session) {
            database.db
                .insert(terminalTabs)
                .values({
                    id: session.id,
                    title: session.title,
                    cwd: session.cwd,
                    command: session.command,
                    runtime: session.runtime,
                    status: session.status,
                    cols: session.size.cols,
                    rows: session.size.rows,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    exitCode: session.exitCode,
                })
                .onConflictDoUpdate({
                    target: terminalTabs.id,
                    set: {
                        title: session.title,
                        cwd: session.cwd,
                        command: session.command,
                        runtime: session.runtime,
                        status: session.status,
                        cols: session.size.cols,
                        rows: session.size.rows,
                        updatedAt: session.updatedAt,
                        exitCode: session.exitCode,
                    },
                })
                .run();
        },

        listTerminalSessions() {
            return database.db.select().from(terminalTabs).all().map((row) => ({
                id: row.id,
                title: row.title,
                cwd: row.cwd,
                command: row.command,
                runtime: row.runtime as TerminalSessionSnapshot['runtime'],
                status: row.status as TerminalSessionSnapshot['status'],
                size: {
                    cols: row.cols,
                    rows: row.rows,
                },
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                exitCode: row.exitCode,
            }));
        },

        saveRun(run) {
            database.db
                .insert(actionRuns)
                .values({
                    id: run.id,
                    actionId: run.actionId,
                    command: run.command,
                    cwd: run.cwd,
                    status: run.status,
                    startedAt: run.startedAt,
                    finishedAt: run.finishedAt,
                    exitCode: run.exitCode,
                })
                .onConflictDoUpdate({
                    target: actionRuns.id,
                    set: {
                        status: run.status,
                        finishedAt: run.finishedAt,
                        exitCode: run.exitCode,
                    },
                })
                .run();
        },
    };
}
