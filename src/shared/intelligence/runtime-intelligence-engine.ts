export interface RuntimeInsight {
    readonly id: string;
    readonly severity: 'info' | 'warning' | 'error';
    readonly title: string;
    readonly description: string;
}

/**
 * Detects runtime insights from terminal output lines.
 *
 * @param lines - Terminal output lines.
 * @returns Runtime insights.
 *
 * @example
 * ```ts
 * detectRuntimeInsights(lines)
 * ```
 */
export function detectRuntimeInsights(
    lines: readonly string[],
): RuntimeInsight[] {
    const insights: RuntimeInsight[] = [];

    const errorCount = lines.filter((line) => line.toLowerCase().includes('error')).length;
    const warningCount = lines.filter((line) => line.toLowerCase().includes('warn')).length;

    if (errorCount > 3) {
        insights.push({
            id: 'runtime:error-spike',
            severity: 'error',
            title: 'High error frequency detected',
            description: `Detected ${errorCount} error lines.`,
        });
    }

    if (warningCount > 5) {
        insights.push({
            id: 'runtime:warning-spike',
            severity: 'warning',
            title: 'Warning spike detected',
            description: `Detected ${warningCount} warning lines.`,
        });
    }

    return insights;
}
