import { describe, expect, it } from 'vitest';
import { detectRuntimeBehaviorInsights } from '../src/shared/runtime/runtime-intelligence-v2';

describe('runtime intelligence v2', () => {
  it('detects degradations', () => {
    const insights = detectRuntimeBehaviorInsights([100, 150]);

    expect(insights).toHaveLength(1);
    expect(insights[0]?.severity).toBe('warning');
  });
});
