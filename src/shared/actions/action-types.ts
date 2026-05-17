import type {WorkspaceAction} from '@/shared/types';

export type {WorkspaceAction};

/**
 * Action groups for sidebar, graph and command palette views.
 */
export interface WorkspaceActionGroup {
    readonly packageId: string;
    readonly packageName: string;
    readonly packagePath: string;
    readonly actions: readonly WorkspaceAction[];
    readonly detectedTools: readonly string[];
}

/**
 * Persisted summary of a run for SQLite `action_runs`.
 */
export interface RunSummary {
    readonly id: string;
    readonly actionId: string;
    readonly command: string;
    readonly cwd: string;
    readonly status: string;
    readonly startedAt: number;
    readonly finishedAt: number | null;
    readonly exitCode: number | null;
}
