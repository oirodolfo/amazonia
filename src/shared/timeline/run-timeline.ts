export type RunTimelineEventType = 'queued' | 'terminal-created' | 'command-started' | 'output-warning' | 'output-error' | 'command-finished';

export interface RunTimelineEvent {
  readonly id: string;
  readonly runId: string;
  readonly type: RunTimelineEventType;
  readonly label: string;
  readonly timestamp: number;
  readonly durationMs: number | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Creates a run timeline event.
 *
 * @param input - Event input.
 * @returns Timeline event.
 *
 * @example
 * ```ts
 * createRunTimelineEvent({ runId: 'run-1', type: 'queued', label: 'Queued' })
 * ```
 */
export function createRunTimelineEvent(input: {
  readonly runId: string;
  readonly type: RunTimelineEventType;
  readonly label: string;
  readonly timestamp?: number;
  readonly durationMs?: number | null;
  readonly metadata?: Readonly<Record<string, unknown>>;
}): RunTimelineEvent {
  return {
    id: `timeline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    runId: input.runId,
    type: input.type,
    label: input.label,
    timestamp: input.timestamp ?? Date.now(),
    durationMs: input.durationMs ?? null,
    metadata: input.metadata ?? {},
  };
}

/**
 * Groups timeline events by run id.
 *
 * @param events - Timeline events.
 * @returns Events grouped by run id.
 *
 * @example
 * ```ts
 * groupTimelineByRun(events)
 * ```
 */
export function groupTimelineByRun(events: readonly RunTimelineEvent[]): Readonly<Record<string, readonly RunTimelineEvent[]>> {
  return events.reduce<Record<string, RunTimelineEvent[]>>((groups, event) => {
    groups[event.runId] ??= [];
    groups[event.runId].push(event);
    return groups;
  }, {});
}
