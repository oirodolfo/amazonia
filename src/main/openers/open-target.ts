import { execFile } from 'node:child_process';
import { shell } from 'electron';
import type { OpenTarget } from '@/shared/openers/open-targets';

/**
 * Opens a parsed output target in the browser or editor.
 *
 * @param target - Target created from terminal output.
 * @returns Promise resolved after the opener is dispatched.
 *
 * @example
 * ```ts
 * await openTarget({ kind: 'browser', value: 'https://example.com', line: null, column: null })
 * ```
 */
export async function openTarget(target: OpenTarget): Promise<void> {
  if (target.kind === 'browser') {
    await shell.openExternal(target.value);
    return;
  }

  if (target.kind === 'editor') {
    const editor = process.env.EDITOR ?? 'code';
    const location = target.line
      ? `${target.value}:${target.line}:${target.column ?? 1}`
      : target.value;

    await new Promise<void>((resolve, reject) => {
      execFile(editor, ['-g', location], (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}
