export type EditorKind = 'vscode' | 'cursor' | 'windsurf' | 'default';

export interface EditorTarget {
  readonly path: string;
  readonly line?: number;
  readonly column?: number;
}

export interface EditorCommandPlan {
  readonly editor: EditorKind;
  readonly command: string;
  readonly args: readonly string[];
}

const EDITOR_COMMANDS: Readonly<Record<Exclude<EditorKind, 'default'>, string>> = {
  vscode: 'code',
  cursor: 'cursor',
  windsurf: 'windsurf',
};

/**
 * Parses terminal file references into editor targets.
 *
 * @param value - A path-like string that may include line and column suffixes.
 * @returns A normalized editor target, or null when the input is empty.
 *
 * @example
 * ```ts
 * parseEditorTarget('src/index.ts:10:2')?.line; // 10
 * ```
 */
export function parseEditorTarget(value: string): EditorTarget | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const match = /^(?<path>.+?)(?::(?<line>\d+))?(?::(?<column>\d+))?$/.exec(trimmed);
  if (match?.groups === undefined) return { path: trimmed };
  return {
    path: match.groups.path,
    line: match.groups.line === undefined ? undefined : Number(match.groups.line),
    column: match.groups.column === undefined ? undefined : Number(match.groups.column),
  };
}

/**
 * Creates a safe command plan for opening a file in a supported editor.
 *
 * @param target - File target to open.
 * @param editor - Preferred editor command.
 * @returns A command plan that can be executed by the host runtime.
 *
 * @example
 * ```ts
 * createEditorCommandPlan({ path: 'src/a.ts', line: 1 }, 'cursor').args;
 * ```
 */
export function createEditorCommandPlan(target: EditorTarget, editor: EditorKind = 'default'): EditorCommandPlan {
  const location = target.line === undefined ? target.path : `${target.path}:${target.line}:${target.column ?? 1}`;
  if (editor === 'default') return { editor, command: location, args: [] };
  return { editor, command: EDITOR_COMMANDS[editor], args: ['-g', location] };
}
