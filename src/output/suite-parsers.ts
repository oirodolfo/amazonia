import type {OutputDiagnostic} from '@/shared/types';
import {parseOutputLinks} from './link-parser';

export type OutputTool = 'vitest' | 'typescript' | 'eslint' | 'turbo' | 'nx' | 'generic';

export interface ParsedToolOutput {
    readonly tool: OutputTool;
    readonly diagnostics: readonly OutputDiagnostic[];
    readonly summary: string;
    readonly confidence: number;
}

const TOOL_PATTERNS: readonly [OutputTool, RegExp][] = [
    ['vitest', /\b(vitest|test files|failed tests|passed tests)\b/i],
    ['typescript', /\b(ts\d{4}|typescript|typecheck|tsc)\b/i],
    ['eslint', /\b(eslint|lint error|lint warning)\b/i],
    ['turbo', /\b(turbo|turborepo|cache hit|cache miss)\b/i],
    ['nx', /\b(nx run|nx affected|nx graph|project graph)\b/i],
];

/**
 * Detects the CLI tool that produced an output blob.
 *
 * @param raw - Raw terminal output.
 * @returns The most likely tool label.
 *
 * @example
 * ```ts
 * detectOutputTool('TS2322: Type string is not assignable'); // 'typescript'
 * ```
 */
export function detectOutputTool(raw: string): OutputTool {
    return TOOL_PATTERNS.find(([, pattern]) => pattern.test(raw))?.[0] ?? 'generic';
}

/**
 * Parses tool-specific output into friendly diagnostics used by the output cards.
 *
 * @param raw - Raw output joined from terminal chunks.
 * @returns Structured diagnostics with a confidence score.
 *
 * @example
 * ```ts
 * parseToolOutput('src/app.ts:10:2 - error TS2322: bad').diagnostics[0].level;
 * ```
 */
export function parseToolOutput(raw: string): ParsedToolOutput {
    const tool = detectOutputTool(raw);
    const links = parseOutputLinks(raw, '');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const diagnostics: OutputDiagnostic[] = [];

    for (const line of lines) {
        const lower = line.toLowerCase();
        const level: OutputDiagnostic['level'] | null = lower.includes('error') || /ts\d{4}/i.test(line)
            ? 'error'
            : lower.includes('warn') || lower.includes('warning')
                ? 'warning'
                : lower.includes('success') || lower.includes('passed')
                    ? 'success'
                    : null;

        if (level === null) continue;

        const linked = links.find((candidate) => line.includes(candidate.raw) || line.includes(candidate.target));
        diagnostics.push({
            level,
            message: line.trim(),
            filePath: linked?.kind === 'file' ? linked.target : undefined,
            url: linked?.kind === 'url' ? linked.target : undefined,
            line: linked?.line,
            column: linked?.column,
        });
    }

    return {
        tool,
        diagnostics,
        summary: createSummary(tool, diagnostics),
        confidence: tool === 'generic' ? 0.45 : 0.82,
    };
}

function createSummary(tool: OutputTool, diagnostics: readonly OutputDiagnostic[]): string {
    const errors = diagnostics.filter((diagnostic) => diagnostic.level === 'error').length;
    const warnings = diagnostics.filter((diagnostic) => diagnostic.level === 'warning').length;
    if (errors === 0 && warnings === 0) return `${tool} completed without obvious diagnostics`;
    return `${tool} reported ${errors} error(s) and ${warnings} warning(s)`;
}
