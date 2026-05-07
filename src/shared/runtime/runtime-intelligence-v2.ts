export interface RuntimeBehaviorInsight {
  readonly id: string;
  readonly severity: 'info' | 'warning' | 'error';
  readonly title: string;
  readonly description: string;
  readonly metric: number;
}

/**
 * Detects behavioral runtime degradations from timing samples.
 *
 * @param samples - Runtime timing samples.
 * @returns Runtime behavior insights.
 *
 * @example
 * ```ts
 * detectRuntimeBehaviorInsights([100, 220])
 * ```
 */
export function detectRuntimeBehaviorInsights(
  samples: readonly number[],
): RuntimeBehaviorInsight[] {
  if (samples.length < 2) {
    return [];
  }

  const first = samples[0] ?? 0;
  const last = samples[samples.length - 1] ?? 0;

  if (first === 0) {
    return [];
  }

  const delta = ((last - first) / first) * 100;

  if (delta > 25) {
    return [{
      id: 'runtime:degradation',
      severity: 'warning',
      title: 'Runtime degradation detected',
      description: `Runtime became ${delta.toFixed(1)}% slower.`,
      metric: delta,
    }];
  }

  return [];
}
