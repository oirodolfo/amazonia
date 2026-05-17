import type {WorkspaceAction} from '@/shared/types';
import {createTerminalCommandPlan} from '@/terminal/command-builder';

export interface TerminalActionPlan {
    readonly sessionTitle: string;
    readonly command: string;
    readonly cwd: string;
}

/**
 * Maps a workspace action to a title/command used by the Warp-style terminal harness.
 */
export function createTerminalActionPlan(action: WorkspaceAction): TerminalActionPlan {
    const plan = createTerminalCommandPlan(action);
    return {
        sessionTitle: plan.title,
        command: plan.command,
        cwd: plan.cwd,
    };
}
