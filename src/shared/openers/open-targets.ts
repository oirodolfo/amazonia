import type {ParsedOutputLink} from '@/shared/output/output-parser';

export type OpenTargetKind = 'browser' | 'editor' | 'unknown';

export interface OpenTarget {
    readonly kind: OpenTargetKind;
    readonly value: string;
    readonly line: number | null;
    readonly column: number | null;
}

/**
 * Converts parsed output links into open targets.
 *
 * @param link - Parsed output link.
 * @returns Target for browser/editor openers.
 *
 * @example
 * ```ts
 * createOpenTarget({ kind: 'url', target: 'https://example.com', raw: 'https://example.com' })
 * ```
 */
export function createOpenTarget(link: ParsedOutputLink): OpenTarget {
    if (link.kind === 'url') {
        return {
            kind: 'browser',
            value: link.target,
            line: null,
            column: null,
        };
    }

    if (link.kind === 'file' || link.kind === 'directory') {
        return {
            kind: 'editor',
            value: link.target,
            line: link.line ?? null,
            column: link.column ?? null,
        };
    }

    return {
        kind: 'unknown',
        value: link.target,
        line: link.line ?? null,
        column: link.column ?? null,
    };
}
