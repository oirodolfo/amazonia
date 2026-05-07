import {eq} from 'drizzle-orm';
import {
    graphSnapshots,
    runtimeDiagnostics,
    runtimeEvents,
    runtimeRuns,
    terminalSections,
} from './runtime-sqlite-schema';
import type {RuntimeSQLiteDatabase} from './runtime-sqlite-database';
import type {
    GraphSnapshotPersistenceRecord,
    RuntimePersistenceRepository,
} from '@/shared/runtime/runtime-persistence-types';
import type {TerminalSection} from '@/shared/terminal/terminal-section-folding';

/**
 * Creates the real SQLite runtime repository.
 *
 * @param database - Runtime SQLite database handles.
 * @returns Runtime persistence repository.
 *
 * @example
 * ```ts
 * const repo = createRuntimeSQLiteRepository(runtimeDb)
 * ```
 */
export function createRuntimeSQLiteRepository(
    database: RuntimeSQLiteDatabase,
): RuntimePersistenceRepository {
    return {
        saveRun(record) {
            database.db
                .insert(runtimeRuns)
                .values({
                    id: record.id,
                    command: record.command,
                    cwd: record.cwd,
                    status: record.status,
                    startedAt: record.startedAt,
                    finishedAt: record.finishedAt,
                    exitCode: record.exitCode,
                })
                .onConflictDoUpdate({
                    target: runtimeRuns.id,
                    set: {
                        command: record.command,
                        cwd: record.cwd,
                        status: record.status,
                        finishedAt: record.finishedAt,
                        exitCode: record.exitCode,
                    },
                })
                .run();
        },

        saveEvent(runId, event) {
            database.db
                .insert(runtimeEvents)
                .values({
                    id: event.id,
                    runId,
                    type: event.type,
                    timestamp: event.timestamp,
                    payload: event.payload,
                })
                .onConflictDoNothing()
                .run();
        },

        listEvents(runId) {
            return database.db
                .select()
                .from(runtimeEvents)
                .where(eq(runtimeEvents.runId, runId))
                .all()
                .map((row) => ({
                    id: row.id,
                    type: row.type,
                    timestamp: row.timestamp,
                    payload: row.payload as Readonly<Record<string, unknown>>,
                }));
        },

        saveDiagnostic(record) {
            database.db
                .insert(runtimeDiagnostics)
                .values({
                    id: record.id,
                    runId: record.runId,
                    severity: record.severity,
                    message: record.message,
                    file: record.file,
                    line: record.line,
                    column: record.column,
                    createdAt: record.createdAt,
                })
                .onConflictDoUpdate({
                    target: runtimeDiagnostics.id,
                    set: {
                        severity: record.severity,
                        message: record.message,
                        file: record.file,
                        line: record.line,
                        column: record.column,
                    },
                })
                .run();
        },

        saveGraphSnapshot(record: GraphSnapshotPersistenceRecord) {
            database.db
                .insert(graphSnapshots)
                .values({
                    id: record.id,
                    workspaceId: record.workspaceId,
                    hash: record.hash,
                    graph: record.graph,
                    createdAt: record.createdAt,
                })
                .onConflictDoUpdate({
                    target: graphSnapshots.id,
                    set: {
                        hash: record.hash,
                        graph: record.graph,
                        createdAt: record.createdAt,
                    },
                })
                .run();
        },

        saveTerminalSection(sessionId: string, section: TerminalSection) {
            database.db
                .insert(terminalSections)
                .values({
                    id: section.id,
                    sessionId,
                    kind: section.kind,
                    title: section.title,
                    severity: section.severity,
                    startedAtLine: section.startedAtLine,
                    endedAtLine: section.endedAtLine,
                    lines: section.lines,
                    createdAt: Date.now(),
                })
                .onConflictDoUpdate({
                    target: terminalSections.id,
                    set: {
                        severity: section.severity,
                        endedAtLine: section.endedAtLine,
                        lines: section.lines,
                    },
                })
                .run();
        },
    };
}
