import { describe, expect, it } from 'vitest';
import { createRuntimeMetricSample, summarizeRuntimeMetrics } from '../src/shared/performance/runtime-metrics';

describe('runtime metrics', () => {
  it('summarizes runtime samples', () => {
    const first = createRuntimeMetricSample({ id: 'a', label: 'A', startedAt: 1, finishedAt: 11 });
    const second = createRuntimeMetricSample({ id: 'b', label: 'B', startedAt: 10, finishedAt: 35 });

    const summary = summarizeRuntimeMetrics([first, second]);

    expect(summary.count).toBe(2);
    expect(summary.totalMs).toBe(35);
    expect(summary.slowest?.id).toBe('b');
  });
});
