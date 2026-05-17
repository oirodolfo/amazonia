import type {SemanticTerminalMarker} from '@/shared/terminal/semantic-terminal-os';

export interface TerminalProblem {
    readonly id: string;
    readonly severity: 'error' | 'warning';
    readonly title: string;
    readonly message: string;
    readonly line: number;
    readonly sourceMarkerId: string;
}

/**
 * Converts semantic terminal markers into a Problems-like model.
 *
 * @param markers - Semantic terminal markers.
 * @returns Terminal problems.
 *
 * @example
 * ```ts
 * createTerminalProblems(snapshot.markers)
 * ```
 */
export function createTerminalProblems(markers: readonly SemanticTerminalMarker[]): TerminalProblem[] {
    return markers
        .filter((marker): marker is SemanticTerminalMarker & {readonly type: 'error' | 'warning'} => marker.type === 'error' || marker.type === 'warning')
        .map((marker) => ({
            id: `problem:${marker.id}`,
            severity: marker.type,
            title: marker.type === 'error' ? 'Terminal error' : 'Terminal warning',
            message: marker.value,
            line: marker.line,
            sourceMarkerId: marker.id,
        }));
}
