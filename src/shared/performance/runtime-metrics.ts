export interface RuntimeMetricSample {
    readonly id: string;
    readonly label: string;
    readonly startedAt: number;
    readonly finishedAt: number;
    readonly durationMs: number;
    readonly metadata: Readonly<Record<string, unknown>>;
}

export interface RuntimeMetricSummary {
    readonly count: number;
    readonly totalMs: number;
    readonly averageMs: number;
    readonly slowest: RuntimeMetricSample | null;
}

/**
 * Creates a runtime metric sample from start and finish timestamps.
 *
 * @param input - Metric sample input.
 * @returns Runtime metric sample.
 *
 * @example
 * ```ts
 * createRuntimeMetricSample({ id: 'scan', label: 'Scan', startedAt: 1, finishedAt: 5 })
 * ```
 */
export function createRuntimeMetricSample(input: {
    readonly id: string;
    readonly label: string;
    readonly startedAt: number;
    readonly finishedAt: number;
    readonly metadata?: Readonly<Record<string, unknown>>;
}): RuntimeMetricSample {
    return {
        id: input.id,
        label: input.label,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        durationMs: Math.max(0, input.finishedAt - input.startedAt),
        metadata: input.metadata ?? {},
    };
}

/**
 * Summarizes runtime metric samples.
 *
 * @param samples - Metric samples.
 * @returns Aggregate runtime summary.
 *
 * @example
 * ```ts
 * summarizeRuntimeMetrics([sample]).averageMs
 * ```
 */
export function summarizeRuntimeMetrics(samples: readonly RuntimeMetricSample[]): RuntimeMetricSummary {
    const totalMs = samples.reduce((total, sample) => total + sample.durationMs, 0);
    const slowest = [...samples].sort((left, right) => right.durationMs - left.durationMs)[0] ?? null;

    return {
        count: samples.length,
        totalMs,
        averageMs: samples.length === 0 ? 0 : totalMs / samples.length,
        slowest,
    };
}
