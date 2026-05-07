import { describe, expect, it } from 'vitest';
import { detectRuntimeInsights } from '../src/shared/intelligence/runtime-intelligence-engine';

describe('runtime intelligence engine', () => {
  it('detects runtime spikes', () => {
    const insights = detectRuntimeInsights([
      'error a',
      'error b',
      'error c',
      'error d',
    ]);

    expect(insights.some((insight) => insight.severity === 'error')).toBe(true);
  });
});
