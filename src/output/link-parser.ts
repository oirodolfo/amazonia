export type OutputLinkKind = 'url' | 'file' | 'directory';

export interface OutputLinkCandidate {
    readonly kind: OutputLinkKind;
    readonly raw: string;
    readonly target: string;
    readonly line?: number;
    readonly column?: number;
}

const URL_PATTERN = /https?:\/\/[^\s)\]}>'"]+/gu;
const FILE_LOCATION_PATTERN = /(?<target>(?:[A-Za-z]:)?(?:\.{1,2}[\\/]|[\\/]|[\w@.-][\w@./\\-]*[\\/])?[\w@./\\-]+\.(?:ts|tsx|js|jsx|json|md|css|scss|html|go|rs|py|yaml|yml))(?::(?<line>\d+))?(?::(?<column>\d+))?/gu;

/**
 * Extracts web URLs and source-file locations from terminal output.
 *
 * @param output - Raw terminal output captured from xterm/node-pty.
 * @param cwd - Directory used to resolve relative file links.
 * @returns Normalized link candidates for the renderer and native bridge.
 *
 * @example
 * ```ts
 * parseOutputLinks('src/app.ts:10:2 error', '/repo')[0]?.line;
 * // 10
 * ```
 */
export function parseOutputLinks(output: string, cwd: string): readonly OutputLinkCandidate[] {
    const links = new Map<string, OutputLinkCandidate>();

    for (const match of output.matchAll(URL_PATTERN)) {
        const raw = match[0];
        links.set(`url:${raw}`, {kind: 'url', raw, target: raw});
    }

    for (const match of output.matchAll(FILE_LOCATION_PATTERN)) {
        const raw = match[0];
        const target = match.groups?.target;
        if (target === undefined) continue;
        const absoluteTarget = resolveOutputPath(cwd, target);
        const line = match.groups?.line === undefined ? undefined : Number(match.groups.line);
        const column = match.groups?.column === undefined ? undefined : Number(match.groups.column);
        links.set(`file:${absoluteTarget}:${line ?? ''}:${column ?? ''}`, {
            kind: 'file',
            raw,
            target: absoluteTarget,
            line,
            column,
        });
    }

    return [...links.values()];
}


function resolveOutputPath(cwd: string, target: string): string {
    if (/^[A-Za-z]:[\\/]/u.test(target) || target.startsWith('/') || target.startsWith('\\')) return target;
    const normalizedCwd = cwd.replaceAll('\\', '/').replace(/\/$/u, '');
    const normalizedTarget = target.replaceAll('\\', '/');
    return `${normalizedCwd}/${normalizedTarget}`;
}
