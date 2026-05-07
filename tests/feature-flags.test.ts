import { describe, expect, it } from 'vitest';
import { createFeatureFlags, isFeatureEnabled } from '../src/shared/feature-flags/feature-flags';

describe('feature flags', () => {
  it('merges overrides over defaults', () => {
    const flags = createFeatureFlags({ enableActionGraph: false });

    expect(isFeatureEnabled(flags, 'enableTimeline')).toBe(true);
    expect(isFeatureEnabled(flags, 'enableActionGraph')).toBe(false);
  });
});
