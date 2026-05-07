export type DiagnosticActionId =
  | 'open-in-editor'
  | 'copy-path'
  | 'copy-message'
  | 'copy-stack'
  | 'focus-run'
  | 'pin-diagnostic';

export interface VividDiagnosticHoverAction {
  readonly id: DiagnosticActionId;
  readonly label: string;
  readonly shortcut: string | null;
}

export interface VividDiagnosticHoverModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly file: string | null;
  readonly line: number | null;
  readonly column: number | null;
  readonly severity: 'error' | 'warning' | 'info';
  readonly previewLines: readonly string[];
  readonly stackLines: readonly string[];
  readonly actions: readonly VividDiagnosticHoverAction[];
  readonly accentTone: 'danger' | 'warning' | 'info';
}

/**
 * Creates a vivid diagnostic hover model for terminal output and graph nodes.
 *
 * @param input - Diagnostic details extracted from runtime output.
 * @returns Rich hover model with preview, stack and actions.
 *
 * @example
 * ```ts
 * createVividDiagnosticHover({
 *   id: 'd1',
 *   message: 'src/index.ts:10:2 error boom',
 *   severity: 'error',
 * })
 * ```
 */
export function createVividDiagnosticHover(input: {
  readonly id: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly file?: string | null;
  readonly line?: number | null;
  readonly column?: number | null;
  readonly stack?: readonly string[];
  readonly preview?: readonly string[];
}): VividDiagnosticHoverModel {
  const file = input.file ?? extractFile(input.message);
  const line = input.line ?? extractLine(input.message);
  const column = input.column ?? extractColumn(input.message);

  return {
    id: input.id,
    title: file ? `${file}${line ? `:${line}` : ''}${column ? `:${column}` : ''}` : input.message,
    subtitle: input.message,
    file,
    line,
    column,
    severity: input.severity,
    previewLines: input.preview?.length ? input.preview : createPreview(input.message),
    stackLines: input.stack ?? [],
    actions: createActions(Boolean(file)),
    accentTone: input.severity === 'error' ? 'danger' : input.severity === 'warning' ? 'warning' : 'info',
  };
}

function createPreview(message: string): string[] {
  return message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 6);
}

function createActions(hasFile: boolean): VividDiagnosticHoverAction[] {
  const common: VividDiagnosticHoverAction[] = [
    { id: 'copy-message', label: 'Copy message', shortcut: 'C' },
    { id: 'copy-stack', label: 'Copy stack', shortcut: 'S' },
    { id: 'focus-run', label: 'Focus run', shortcut: 'F' },
    { id: 'pin-diagnostic', label: 'Pin', shortcut: 'P' },
  ];

  return hasFile
    ? [
        { id: 'open-in-editor', label: 'Open in editor', shortcut: 'Enter' },
        { id: 'copy-path', label: 'Copy path', shortcut: 'Shift+C' },
        ...common,
      ]
    : common;
}

function extractFile(message: string): string | null {
  return message.match(/((?:[A-Za-z]:)?[^\s:]+\.(?:ts|tsx|js|jsx|json|css|scss|md))/)?.[1] ?? null;
}

function extractLine(message: string): number | null {
  const raw = message.match(/[^\s:]+\.(?:ts|tsx|js|jsx|json|css|scss|md):(\d+)/)?.[1];
  return raw ? Number(raw) : null;
}

function extractColumn(message: string): number | null {
  const raw = message.match(/[^\s:]+\.(?:ts|tsx|js|jsx|json|css|scss|md):\d+:(\d+)/)?.[1];
  return raw ? Number(raw) : null;
}
