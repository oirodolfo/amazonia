import type {SemanticTerminalSnapshot} from '@/shared/terminal/semantic-terminal-os';

export interface TerminalReplayFrame {
    readonly index: number;
    readonly line: string;
    readonly markerCount: number;
    readonly timestamp: number;
}

export interface TerminalReplayTimeline {
    readonly frames: readonly TerminalReplayFrame[];
    readonly totalMarkers: number;
}

/**
 * Creates a replay timeline from a semantic terminal snapshot.
 *
 * @param snapshot - Semantic terminal snapshot.
 * @param startedAt - Replay start timestamp.
 * @returns Replay timeline.
 *
 * @example
 * ```ts
 * createTerminalReplayTimeline(snapshot, Date.now())
 * ```
 */
export function createTerminalReplayTimeline(
    snapshot: SemanticTerminalSnapshot,
    startedAt: number,
): TerminalReplayTimeline {
    return {
        frames: snapshot.lines.map((line, index) => ({
            index,
            line,
            markerCount: snapshot.markers.filter((marker) => marker.line === index).length,
            timestamp: startedAt + index,
        })),
        totalMarkers: snapshot.markers.length,
    };
}
