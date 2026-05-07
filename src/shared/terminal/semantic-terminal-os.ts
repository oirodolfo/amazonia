export type SemanticTerminalMarkerType =
  | 'command'
  | 'error'
  | 'warning'
  | 'success'
  | 'stacktrace'
  | 'url'
  | 'file';

export interface SemanticTerminalMarker {
  readonly id: string;
  readonly type: SemanticTerminalMarkerType;
  readonly value: string;
  readonly line: number;
}

export interface SemanticTerminalSnapshot {
  readonly markers: readonly SemanticTerminalMarker[];
  readonly lines: readonly string[];
}

const STACKTRACE_PATTERN = /(at\s.+\(.+\))/i;
const URL_PATTERN = /https?:\/\/\S+/i;
const FILE_PATTERN = /([A-Za-z]:\\|\/).+\.(ts|tsx|js|jsx|json)/i;

/**
 * Builds a semantic snapshot from terminal output.
 *
 * @param raw - Raw terminal output.
 * @returns Semantic terminal snapshot.
 */
export function createSemanticTerminalSnapshot(
  raw: string,
): SemanticTerminalSnapshot {
  const lines = raw.split(/\r?\n/);
  const markers: SemanticTerminalMarker[] = [];

  lines.forEach((line, index) => {
    const normalized = line.toLowerCase();

    if (normalized.includes('error')) {
      markers.push({
        id: `error:${index}`,
        type: 'error',
        value: line,
        line: index,
      });
    }

    if (normalized.includes('warning')) {
      markers.push({
        id: `warning:${index}`,
        type: 'warning',
        value: line,
        line: index,
      });
    }

    if (STACKTRACE_PATTERN.test(line)) {
      markers.push({
        id: `stack:${index}`,
        type: 'stacktrace',
        value: line,
        line: index,
      });
    }

    if (URL_PATTERN.test(line)) {
      markers.push({
        id: `url:${index}`,
        type: 'url',
        value: line.match(URL_PATTERN)?.[0] ?? line,
        line: index,
      });
    }

    if (FILE_PATTERN.test(line)) {
      markers.push({
        id: `file:${index}`,
        type: 'file',
        value: line.match(FILE_PATTERN)?.[0] ?? line,
        line: index,
      });
    }
  });

  return {
    markers,
    lines,
  };
}
