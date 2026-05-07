import type {RunRecord, WorkspaceAction} from '@/shared/types';

export interface ActionRunPlan {
    readonly run: RunRecord;
    readonly tabTitle: string;
}

/**
 * Creates a deterministic run plan for a workspace action before it is sent to a terminal.
 *
 * @param action - Action selected by the user.
 * @param now - Injectable clock used by tests and persistence replay.
 * @returns A run record and a readable tab title.
 *
 * @example
 * ```ts
 * const plan = createActionRunPlan(action, () => new Date('2026-01-01T00:00:00.000Z'));
 * plan.run.status // 'running'
 * ```
 */
export function createActionRunPlan(action: WorkspaceAction, now: () => Date = () => new Date()): ActionRunPlan {
    const startedAtIso = now().toISOString();
    return {
        run: {
            id: `${action.id}:${startedAtIso}`,
            actionId: action.id,
            command: action.command,
            cwd: action.cwd,
            startedAtIso,
            status: 'running',
        },
        tabTitle: `${action.packageName} › ${action.label}`,
    };
}

/**
 * Finalizes a run with timing and status metadata.
 *
 * @param run - Previously started run.
 * @param exitCode - Process exit code returned by the terminal host.
 * @param endedAt - Injectable end timestamp.
 * @returns A completed run record.
 *
 * @example
 * ```ts
 * finishRun(run, 0).status // 'success'
 * finishRun(run, 1).status // 'failed'
 * ```
 */
export function finishRun(run: RunRecord, exitCode: number, endedAt: Date = new Date()): RunRecord {
    const durationMs = Math.max(0, endedAt.getTime() - new Date(run.startedAtIso).getTime());
    return {
        ...run,
        endedAtIso: endedAt.toISOString(),
        durationMs,
        exitCode,
        status: exitCode === 0 ? 'success' : 'failed',
    };
}
