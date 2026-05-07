import {execFile} from 'node:child_process';
import type {DiagnosticLocation} from '@/shared/diagnostics/actionable-diagnostic-types';
import {createEditorOpenCommand} from '@/shared/openers/editor-open-command';

/**
 * Opens a diagnostic location in the default editor.
 *
 * @param location - Diagnostic location.
 * @returns Promise resolved when the editor command exits.
 *
 * @example
 * ```ts
 * await openDiagnosticLocation({ file: 'src/index.ts', line: 10, column: 2 })
 * ```
 */
export async function openDiagnosticLocation(
    location: DiagnosticLocation | null,
): Promise<boolean> {
    const command = createEditorOpenCommand(location);

    if (!command) {
        return false;
    }

    await new Promise<void>((resolve, reject) => {
        execFile(command.executable, command.args, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

    return true;
}
