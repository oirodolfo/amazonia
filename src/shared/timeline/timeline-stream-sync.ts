import type {TerminalDataFrame, TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';
import {createRunTimelineEvent, type RunTimelineEvent} from './run-timeline';

/**
 * Converts terminal data frames to timeline events.
 *
 * @param frame - Terminal data frame.
 * @returns Timeline event or null.
 *
 * @example
 * ```ts
 * terminalFrameToTimelineEvent(frame)
 * ```
 */
export function terminalFrameToTimelineEvent(frame: TerminalDataFrame): RunTimelineEvent | null {
    const lower = frame.data.toLowerCase();

    if (lower.includes('error')) {
        return createRunTimelineEvent({
            runId: frame.sessionId,
            type: 'output-error',
            label: 'Error output',
            timestamp: frame.receivedAt,
            metadata: {sample: frame.data.slice(0, 300)},
        });
    }

    if (lower.includes('warn')) {
        return createRunTimelineEvent({
            runId: frame.sessionId,
            type: 'output-warning',
            label: 'Warning output',
            timestamp: frame.receivedAt,
            metadata: {sample: frame.data.slice(0, 300)},
        });
    }

    return null;
}

/**
 * Converts terminal status snapshots to timeline events.
 *
 * @param snapshot - Terminal status snapshot.
 * @returns Timeline event.
 *
 * @example
 * ```ts
 * terminalStatusToTimelineEvent(snapshot)
 * ```
 */
export function terminalStatusToTimelineEvent(snapshot: TerminalSessionSnapshot): RunTimelineEvent {
    return createRunTimelineEvent({
        runId: snapshot.id,
        type: snapshot.status === 'exited' ? 'command-finished' : 'command-started',
        label: `Terminal ${snapshot.status}`,
        timestamp: snapshot.updatedAt,
        metadata: {
            command: snapshot.command,
            title: snapshot.title,
            cwd: snapshot.cwd,
            exitCode: snapshot.exitCode,
        },
    });
}
