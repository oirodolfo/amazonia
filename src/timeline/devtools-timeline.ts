import type {RunRecord} from '@/shared/types';

export type TimelineEventKind = 'terminal' | 'action' | 'parser' | 'workspace' | 'persistence';

export interface TimelineEventInput {
    readonly id: string;
    readonly kind: TimelineEventKind;
    readonly label: string;
    readonly startedAtMs: number;
    readonly endedAtMs?: number;
    readonly parentId?: string;
    readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}

export interface TimelineEvent extends TimelineEventInput {
    readonly durationMs: number;
    readonly status: 'running' | 'success' | 'failed';
}

export interface TimelineLane {
    readonly kind: TimelineEventKind;
    readonly events: readonly TimelineEvent[];
    readonly totalDurationMs: number;
}

export interface TimelineSnapshot {
    readonly lanes: readonly TimelineLane[];
    readonly totalDurationMs: number;
    readonly startedAtMs: number;
    readonly endedAtMs: number;
}

const TIMELINE_ORDER: readonly TimelineEventKind[] = ['workspace', 'action', 'terminal', 'parser', 'persistence'];

/**
 * Creates a normalized DevTools-style timeline snapshot from raw events.
 *
 * @remarks
 * This replaces hand-built UI timelines with one deterministic data model that can be rendered by Electron,
 * Web mode and tests. It keeps events grouped by domain while preserving precise durations for run analysis.
 *
 * @param events - Raw timeline events collected while scanning, running and parsing output.
 * @returns A lane-based timeline snapshot ready for renderer components.
 *
 * @example
 * ```ts
 * const snapshot = createDevtoolsTimeline([{ id: 'scan', kind: 'workspace', label: 'Scan', startedAtMs: 0, endedAtMs: 5 }]);
 * snapshot.lanes[0]?.totalDurationMs;
 * ```
 */
export function createDevtoolsTimeline(events: readonly TimelineEventInput[]): TimelineSnapshot {
    const normalized = events.map(normalizeEvent).sort((left, right) => left.startedAtMs - right.startedAtMs || left.label.localeCompare(right.label));
    const startedAtMs = normalized.at(0)?.startedAtMs ?? 0;
    const endedAtMs = Math.max(startedAtMs, ...normalized.map((event) => event.endedAtMs ?? event.startedAtMs));
    const lanes = TIMELINE_ORDER.map((kind) => toLane(kind, normalized)).filter((lane) => lane.events.length > 0);

    return Object.freeze({lanes, totalDurationMs: endedAtMs - startedAtMs, startedAtMs, endedAtMs});
}

/**
 * Converts persisted run records into timeline events.
 *
 * @param runs - Persisted run history records.
 * @returns Timeline events using run start/end timestamps and status metadata.
 *
 * @example
 * ```ts
 * const events = runsToTimelineEvents([run]);
 * events[0]?.kind;
 * ```
 */
export function runsToTimelineEvents(runs: readonly RunRecord[]): readonly TimelineEventInput[] {
    return runs.map((run) => ({
        id: run.id,
        kind: 'action',
        label: run.command,
        startedAtMs: Date.parse(run.startedAtIso),
        endedAtMs: run.endedAtIso === undefined ? undefined : Date.parse(run.endedAtIso),
        metadata: {
            cwd: run.cwd,
            status: run.status,
            exitCode: run.exitCode ?? -1,
            durationMs: run.durationMs ?? 0,
        },
    }));
}

function normalizeEvent(input: TimelineEventInput): TimelineEvent {
    const endedAtMs = input.endedAtMs ?? input.startedAtMs;
    const durationMs = Math.max(0, endedAtMs - input.startedAtMs);
    const status = input.endedAtMs === undefined ? 'running' : hasFailure(input) ? 'failed' : 'success';
    return Object.freeze({...input, durationMs, status});
}

function toLane(kind: TimelineEventKind, events: readonly TimelineEvent[]): TimelineLane {
    const laneEvents = events.filter((event) => event.kind === kind);
    return Object.freeze({
        kind,
        events: laneEvents,
        totalDurationMs: laneEvents.reduce((total, event) => total + event.durationMs, 0),
    });
}

function hasFailure(input: TimelineEventInput): boolean {
    return input.metadata?.status === 'failed' || (input.metadata?.exitCode !== undefined && Number(input.metadata.exitCode) > 0);
}
