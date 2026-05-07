import type {WorkspaceAction} from '@/shared/actions/action-types';
import {createLocalAnalyticsEvent} from '@/analytics/local-analytics';
import {incrementActionFrequency, type WorkbenchStoreSnapshot} from '@/shared/persistence/workbench-store';
import type {WorkbenchRuntime} from '@/shared/runtime/runtime-types';
import {createTerminalActionPlan} from '@/shared/terminal/action-terminal-planner';
import type {WorkbenchTerminalClient} from '@/renderer/terminal/workbench-terminal-client';

export interface RunActionControllerInput {
    readonly action: WorkspaceAction;
    readonly runtime: WorkbenchRuntime;
    readonly terminalClient: WorkbenchTerminalClient;
    readonly store: WorkbenchStoreSnapshot;
}

export interface RunActionControllerResult {
    readonly nextStore: WorkbenchStoreSnapshot;
    readonly analyticsEvents: readonly ReturnType<typeof createLocalAnalyticsEvent>[];
}

/**
 * Runs a sidebar action through the terminal client and updates local usage state.
 *
 * @param input - Action, runtime, terminal client and current store snapshot.
 * @returns Updated store and local analytics events.
 *
 * @example
 * ```ts
 * await runWorkbenchAction({ action, runtime: 'electron', terminalClient, store })
 * ```
 */
export async function runWorkbenchAction(
    input: RunActionControllerInput,
): Promise<RunActionControllerResult> {
    const plan = createTerminalActionPlan(input.action);

    await input.terminalClient.runAction({
        actionId: input.action.id,
        title: plan.sessionTitle,
        command: plan.command,
        cwd: plan.cwd,
        runtime: input.runtime,
    });

    return {
        nextStore: incrementActionFrequency(input.store, input.action.id),
        analyticsEvents: [
            createLocalAnalyticsEvent('action.clicked', {actionId: input.action.id}),
            createLocalAnalyticsEvent('action.started', {
                actionId: input.action.id,
                command: input.action.command,
                cwd: input.action.cwd,
            }),
        ],
    };
}
