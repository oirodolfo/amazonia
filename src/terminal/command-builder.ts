import type {WorkspaceAction} from '@/shared/types';

export interface TerminalCommandPlan {
    readonly tabId: string;
    readonly title: string;
    readonly command: string;
    readonly cwd: string;
    readonly cols: number;
    readonly rows: number;
}

const DEFAULT_COLUMNS = 120;
const DEFAULT_ROWS = 32;
const MAX_TITLE_LENGTH = 32;

/**
 * Converts a workspace action into a terminal spawn plan.
 *
 * @remarks
 * This centralizes shell tab naming and terminal defaults so UI, IPC and WebSocket mode do not each invent their own
 * slightly different command shape. The command itself is left untouched to avoid breaking package-manager semantics.
 *
 * @param action - Workspace action selected by the user.
 * @param nowIso - Stable timestamp used for deterministic tests.
 * @returns A terminal command plan ready for `spawnTerminal`.
 *
 * @example
 * ```ts
 * createTerminalCommandPlan(action, '2026-01-01T00:00:00.000Z').rows;
 * // => 32
 * ```
 */
export function createTerminalCommandPlan(action: WorkspaceAction, nowIso = new Date().toISOString()): TerminalCommandPlan {
    const suffix = nowIso.replaceAll(/\D/gu, '').slice(8, 14);
    return {
        tabId: `${action.id}:${suffix}`,
        title: shortenTitle(`${action.packageName} › ${action.label}`),
        command: action.command,
        cwd: action.cwd,
        cols: DEFAULT_COLUMNS,
        rows: DEFAULT_ROWS,
    };
}

function shortenTitle(title: string): string {
    if (title.length <= MAX_TITLE_LENGTH) return title;
    return `${title.slice(0, MAX_TITLE_LENGTH - 1)}…`;
}
