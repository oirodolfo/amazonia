export type TerminalSectionKind = 'command' | 'build' | 'test' | 'lint' | 'install' | 'error' | 'generic';

export interface TerminalSection {
    readonly id: string;
    readonly kind: TerminalSectionKind;
    readonly title: string;
    readonly startedAtLine: number;
    readonly endedAtLine: number | null;
    readonly lines: readonly string[];
    readonly isFoldable: boolean;
    readonly defaultCollapsed: boolean;
    readonly severity: 'neutral' | 'success' | 'warning' | 'error';
}

/**
 * Groups terminal output lines into foldable semantic sections.
 *
 * @param lines - Terminal output lines.
 * @returns Foldable terminal sections.
 *
 * @example
 * ```ts
 * createTerminalSections(['pnpm build', 'error boom'])
 * ```
 */
export function createTerminalSections(lines: readonly string[]): TerminalSection[] {
    const sections: MutableTerminalSection[] = [];

    for (const [index, line] of lines.entries()) {
        const kind = inferSectionKind(line);
        const current = sections.at(-1);

        if (!current || shouldStartNewSection(line, kind)) {
            sections.push({
                id: `section:${sections.length}:${index}`,
                kind,
                title: createSectionTitle(line, kind),
                startedAtLine: index,
                endedAtLine: null,
                lines: [],
                severity: 'neutral',
            });
        }

        const next = sections.at(-1)!;
        next.lines.push(line);
        next.severity = mergeSeverity(next.severity, inferSeverity(line));
    }

    return sections.map((section) => ({
        ...section,
        endedAtLine: section.startedAtLine + section.lines.length - 1,
        isFoldable: section.lines.length > 3,
        defaultCollapsed: section.lines.length > 20 || section.severity === 'neutral',
    }));
}

/**
 * Toggles a folded section id in a set-like array.
 *
 * @param foldedIds - Currently folded ids.
 * @param sectionId - Section to toggle.
 * @returns Updated folded ids.
 *
 * @example
 * ```ts
 * toggleFoldedSection([], 'section:0')
 * ```
 */
export function toggleFoldedSection(foldedIds: readonly string[], sectionId: string): string[] {
    return foldedIds.includes(sectionId)
        ? foldedIds.filter((id) => id !== sectionId)
        : [...foldedIds, sectionId];
}

interface MutableTerminalSection {
    id: string;
    kind: TerminalSectionKind;
    title: string;
    startedAtLine: number;
    endedAtLine: number | null;
    lines: string[];
    severity: TerminalSection['severity'];
}

function shouldStartNewSection(line: string, kind: TerminalSectionKind): boolean {
    const lower = line.toLowerCase();
    return kind === 'command'
        || lower.includes('> ')
        || lower.startsWith('$ ')
        || lower.includes('running ')
        || lower.includes('build')
        || lower.includes('test')
        || lower.includes('lint')
        || lower.includes('install');
}

function inferSectionKind(line: string): TerminalSectionKind {
    const lower = line.toLowerCase();
    if (lower.includes('error')) return 'error';
    if (lower.includes('test') || lower.includes('vitest')) return 'test';
    if (lower.includes('build') || lower.includes('compile')) return 'build';
    if (lower.includes('lint') || lower.includes('eslint')) return 'lint';
    if (lower.includes('install') || lower.includes('pnpm i')) return 'install';
    if (lower.startsWith('$') || lower.includes('> ')) return 'command';
    return 'generic';
}

function createSectionTitle(line: string, kind: TerminalSectionKind): string {
    return kind === 'generic' ? line.trim().slice(0, 80) || 'Output' : `${kind}: ${line.trim().slice(0, 80)}`;
}

function inferSeverity(line: string): TerminalSection['severity'] {
    const lower = line.toLowerCase();
    if (lower.includes('error') || lower.includes('failed')) return 'error';
    if (lower.includes('warn')) return 'warning';
    if (lower.includes('done') || lower.includes('success') || lower.includes('passed')) return 'success';
    return 'neutral';
}

function mergeSeverity(current: TerminalSection['severity'], next: TerminalSection['severity']): TerminalSection['severity'] {
    const order = {neutral: 0, success: 1, warning: 2, error: 3};
    return order[next] > order[current] ? next : current;
}
