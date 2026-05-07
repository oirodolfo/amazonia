import type { RunTimelineEvent, RunTimelineEventType } from './run-timeline';

export type TimelineSeverity = 'success' | 'info' | 'warning' | 'error';

export interface TimelineLane {
  readonly runId: string;
  readonly label: string;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly durationMs: number;
  readonly events: readonly RunTimelineEvent[];
  readonly severity: TimelineSeverity;
  readonly leftPercent: number;
  readonly widthPercent: number;
}

export interface VisualTimelineModel {
  readonly startedAt: number;
  readonly endedAt: number;
  readonly durationMs: number;
  readonly lanes: readonly TimelineLane[];
}

const ERROR_EVENTS = new Set<RunTimelineEventType>(['output-error']);
const WARNING_EVENTS = new Set<RunTimelineEventType>(['output-warning']);

/**
 * Builds a visual timeline model with lanes scaled to a shared time range.
 *
 * @param events - Raw runtime timeline events.
 * @returns Visual timeline model ready for rendering.
 *
 * @example
 * ```ts
 * buildVisualTimelineModel(events).lanes
 * ```
 */
export function buildVisualTimelineModel(events: readonly RunTimelineEvent[]): VisualTimelineModel {
  if (events.length === 0) {
    const now = Date.now();
    return { startedAt: now, endedAt: now, durationMs: 0, lanes: [] };
  }
  const sorted = [...events].sort((left, right) => left.timestamp - right.timestamp);
  const startedAt = sorted[0]!.timestamp;
  const endedAt = Math.max(...sorted.map((event) => event.timestamp + (event.durationMs ?? 0)));
  const durationMs = Math.max(1, endedAt - startedAt);
  const grouped = groupEventsByRun(sorted);
  return { startedAt, endedAt, durationMs, lanes: Object.entries(grouped).map(([runId, runEvents]) => createTimelineLane(runId, runEvents, startedAt, durationMs)).sort((left, right) => left.startedAt - right.startedAt) };
}

/**
 * Resolves a timeline lane severity.
 *
 * @param events - Events belonging to the lane.
 * @returns Highest lane severity.
 *
 * @example
 * ```ts
 * resolveTimelineSeverity(events)
 * ```
 */
export function resolveTimelineSeverity(events: readonly RunTimelineEvent[]): TimelineSeverity {
  if (events.some((event) => ERROR_EVENTS.has(event.type))) return 'error';
  if (events.some((event) => WARNING_EVENTS.has(event.type))) return 'warning';
  if (events.some((event) => event.type === 'command-finished')) return 'success';
  return 'info';
}

function groupEventsByRun(events: readonly RunTimelineEvent[]): Record<string, RunTimelineEvent[]> {
  return events.reduce<Record<string, RunTimelineEvent[]>>((groups, event) => { groups[event.runId] ??= []; groups[event.runId]!.push(event); return groups; }, {});
}

function createTimelineLane(runId: string, events: readonly RunTimelineEvent[], globalStart: number, globalDuration: number): TimelineLane {
  const startedAt = Math.min(...events.map((event) => event.timestamp));
  const endedAt = Math.max(...events.map((event) => event.timestamp + (event.durationMs ?? 0)));
  const durationMs = Math.max(1, endedAt - startedAt);
  return { runId, label: resolveLaneLabel(events), startedAt, endedAt, durationMs, events, severity: resolveTimelineSeverity(events), leftPercent: Number((((startedAt - globalStart) / globalDuration) * 100).toFixed(3)), widthPercent: Number(Math.max(1, (durationMs / globalDuration) * 100).toFixed(3)) };
}

function resolveLaneLabel(events: readonly RunTimelineEvent[]): string {
  const commandEvent = events.find((event) => typeof event.metadata.command === 'string');
  if (commandEvent && typeof commandEvent.metadata.command === 'string') return commandEvent.metadata.command;
  const titleEvent = events.find((event) => typeof event.metadata.title === 'string');
  if (titleEvent && typeof titleEvent.metadata.title === 'string') return titleEvent.metadata.title;
  return events[0]?.label ?? 'run';
}
