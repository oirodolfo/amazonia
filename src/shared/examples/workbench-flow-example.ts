import type {WorkspaceAction} from '@/shared/actions/action-types';
import {createTerminalActionPlan} from '@/shared/terminal/action-terminal-planner';
import {createRuntimeMetricSample} from '@/shared/performance/runtime-metrics';

/**
 * Demonstrates the production flow from action selection to terminal plan.
 *
 * @param action - Workspace action selected by the user.
 * @returns Concrete example result used by docs and tests.
 *
 * @example
 * ```ts
 * createWorkbenchFlowExample(action).plan.command
 * ```
 */
export function createWorkbenchFlowExample(action: WorkspaceAction): {
    readonly plan: ReturnType<typeof createTerminalActionPlan>;
    readonly metric: ReturnType<typeof createRuntimeMetricSample>;
} {
    return {
        plan: createTerminalActionPlan(action),
        metric: createRuntimeMetricSample({
            id: `flow:${action.id}`,
            label: `Run ${action.name}`,
            startedAt: 100,
            finishedAt: 118,
            metadata: {
                packageName: action.packageName,
                command: action.command,
            },
        }),
    };
}
