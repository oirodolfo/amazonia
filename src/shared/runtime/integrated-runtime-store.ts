import type {RuntimePersistenceRepository} from '@/shared/runtime/runtime-persistence-types';
import {
    createWorkbenchRuntimeStore,
    type RuntimeStoreEvent,
    type WorkbenchRuntimeStore,
} from '@/shared/runtime/workbench-runtime-store';
import {
    appendTerminalStreamFrame,
    createTerminalStreamFrame,
    type TerminalStreamFrame,
} from '@/shared/terminal/terminal-stream-model';
import {terminalFrameToTimelineEvent} from '@/shared/timeline/timeline-stream-sync';

export interface IntegratedRuntimeState {
    readonly events: readonly RuntimeStoreEvent[];
    readonly terminalFrames: Readonly<Record<string, readonly TerminalStreamFrame[]>>;
}

export interface IntegratedRuntimeStore {
    readonly state: IntegratedRuntimeState;

    publishTerminalData(input: {
        readonly sessionId: string;
        readonly data: string;
        readonly receivedAt: number;
    }): void;

    publishEvent(runId: string, event: RuntimeStoreEvent): void;

    clear(): void;
}

/**
 * Creates the single integrated runtime store used by Electron, terminal and UI wiring.
 *
 * @param repository - Optional persistence repository.
 * @returns Integrated runtime store.
 *
 * @example
 * ```ts
 * const store = createIntegratedRuntimeStore(repository)
 * store.publishTerminalData({ sessionId: 'term', data: 'error', receivedAt: Date.now() })
 * ```
 */
export function createIntegratedRuntimeStore(
    repository?: RuntimePersistenceRepository,
): IntegratedRuntimeStore {
    const runtimeStore: WorkbenchRuntimeStore = createWorkbenchRuntimeStore();
    let terminalFrames: Record<string, TerminalStreamFrame[]> = {};

    return {
        get state() {
            return {
                events: runtimeStore.events,
                terminalFrames,
            };
        },

        publishTerminalData(input) {
            const frame = createTerminalStreamFrame({
                sessionId: input.sessionId,
                raw: input.data,
                receivedAt: input.receivedAt,
            });

            terminalFrames = {
                ...terminalFrames,
                [input.sessionId]: appendTerminalStreamFrame(
                    terminalFrames[input.sessionId] ?? [],
                    frame,
                ),
            };

            for (const section of frame.sections) {
                repository?.saveTerminalSection(input.sessionId, section);
            }

            const timelineEvent = terminalFrameToTimelineEvent({
                sessionId: input.sessionId,
                data: input.data,
                receivedAt: input.receivedAt,
            });

            if (timelineEvent) {
                this.publishEvent(input.sessionId, {
                    id: timelineEvent.id,
                    type: timelineEvent.type,
                    timestamp: timelineEvent.timestamp,
                    payload: timelineEvent.metadata,
                });
            }
        },

        publishEvent(runId, event) {
            runtimeStore.publish(event);
            repository?.saveEvent(runId, event);
        },

        clear() {
            runtimeStore.clear();
            terminalFrames = {};
        },
    };
}
