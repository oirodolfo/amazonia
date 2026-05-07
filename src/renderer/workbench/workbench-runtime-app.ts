import {createWorkbenchHydrationPlan} from '@/renderer/persistence/workbench-hydration';
import type {WorkbenchTerminalClient} from '@/renderer/terminal/workbench-terminal-client';
import {planTerminalTabRestore} from '@/renderer/terminal/terminal-restore';
import {
    createEmptyWorkbenchState,
    type WorkbenchEvent,
    workbenchReducer,
    type WorkbenchState,
} from '@/renderer/workbench/workbench-state';
import {createWorkbenchController, type WorkbenchController} from '@/renderer/workbench/workbench-controller';
import {emptyPersistedWorkbenchState, type PersistedWorkbenchState} from '@/shared/persistence/persistence-types';
import {createRunTimelineEvent, type RunTimelineEvent} from '@/shared/timeline/run-timeline';
import type {WorkbenchRuntime} from '@/shared/runtime/runtime-types';

export interface WorkbenchRuntimeApp {
    controller: WorkbenchController;

    getState(): WorkbenchState;

    getTimeline(): readonly RunTimelineEvent[];

    dispatch(event: WorkbenchEvent): void;

    hydrate(): Promise<void>;

    persist(): Promise<void>;

    dispose(): void;
}

export interface CreateWorkbenchRuntimeAppOptions {
    readonly runtime: WorkbenchRuntime;
    readonly terminalClient: WorkbenchTerminalClient;
    readonly loadState: () => Promise<PersistedWorkbenchState>;
    readonly saveState: (state: PersistedWorkbenchState) => Promise<boolean>;
}

/**
 * Creates the renderer runtime app that wires hydration, persistence and terminal events.
 *
 * @param options - Runtime services.
 * @returns Workbench runtime app.
 *
 * @example
 * ```ts
 * const app = createWorkbenchRuntimeApp({ runtime, terminalClient, loadState, saveState })
 * await app.hydrate()
 * ```
 */
export function createWorkbenchRuntimeApp(options: CreateWorkbenchRuntimeAppOptions): WorkbenchRuntimeApp {
    let state = createEmptyWorkbenchState(createWorkbenchHydrationPlan(emptyPersistedWorkbenchState).store);
    const timeline: RunTimelineEvent[] = [];

    const dispatch = (event: WorkbenchEvent): void => {
        state = workbenchReducer(state, event);

        if (event.type === 'terminal.session.upserted') {
            timeline.push(createRunTimelineEvent({
                runId: event.session.id,
                type: event.session.status === 'running' ? 'command-started' : 'terminal-created',
                label: `Terminal ${event.session.status}`,
            }));
        }

        if (event.type === 'output.card.added') {
            if (event.card.summary.errors > 0) {
                timeline.push(createRunTimelineEvent({
                    runId: event.card.sessionId,
                    type: 'output-error',
                    label: `${event.card.summary.errors} error(s) detected`,
                }));
            }

            if (event.card.summary.warnings > 0) {
                timeline.push(createRunTimelineEvent({
                    runId: event.card.sessionId,
                    type: 'output-warning',
                    label: `${event.card.summary.warnings} warning(s) detected`,
                }));
            }
        }
    };

    const controller = createWorkbenchController({
        runtime: options.runtime,
        terminalClient: options.terminalClient,
        getState: () => state,
        dispatch,
    });

    return {
        getState: () => state,
        getTimeline: () => timeline,
        dispatch,
        controller,

        async hydrate() {
            const persisted = await options.loadState();
            const plan = createWorkbenchHydrationPlan(persisted);
            state = createEmptyWorkbenchState(plan.store);

            for (const restored of planTerminalTabRestore(plan.terminalSessions)) {
                dispatch({type: 'terminal.session.upserted', session: restored.session});
            }
        },

        async persist() {
            await options.saveState({
                actionFrequencies: state.store.actionFrequencies,
                favoriteActionIds: state.store.favoriteActionIds,
                pinnedPackageIds: state.store.pinnedPackageIds,
                layout: state.store.layout,
                terminalSessions: state.terminalTabs.sessions,
            });
        },

        dispose() {
            timeline.length = 0;
        },
    };
}
