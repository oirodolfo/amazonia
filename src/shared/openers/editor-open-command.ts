import type {DiagnosticLocation} from '@/shared/diagnostics/actionable-diagnostic-types';

export interface EditorOpenCommand {
    readonly executable: string;
    readonly args: readonly string[];
}

/**
 * Builds a default editor command for a diagnostic location.
 *
 * @param location - Diagnostic location.
 * @param editor - Optional editor executable.
 * @returns Editor command or null.
 *
 * @example
 * ```ts
 * createEditorOpenCommand({ file: 'src/index.ts', line: 10, column: 2 }, 'code')
 * ```
 */
export function createEditorOpenCommand(
    location: DiagnosticLocation | null,
    editor = process.env.EDITOR ?? 'code',
): EditorOpenCommand | null {
    if (!location) {
        return null;
    }

    const target = location.line
        ? `${location.file}:${location.line}:${location.column ?? 1}`
        : location.file;

    return {
        executable: editor,
        args: ['-g', target],
    };
}
