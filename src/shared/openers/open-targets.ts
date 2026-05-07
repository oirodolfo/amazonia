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
 * createOpenTarget({ type: 'url', value: 'https://example.com', line: null, column: null })
 * ```
 */
export function createOpenTarget(link: ParsedOutputLink): OpenTarget {
    if (link.type === 'url') {
        return {
            kind: 'browser',
            value: link.value,
            line: null,
            column: null,
        };
    }

    if (link.type === 'file') {
        return {
            kind: 'editor',
            value: link.value,
            line: link.line,
            column: link.column,
        };
    }

    return {
        kind: 'unknown',
        value: link.value,
        line: link.line,
        column: link.column,
    };
}
