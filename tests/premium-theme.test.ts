import { describe, expect, it } from 'vitest';
import { cx, getPremiumSurfaceTokens } from '../src/shared/ui/premium-theme';

describe('premium theme', () => {
  it('returns tone tokens', () => {
    expect(getPremiumSurfaceTokens('forest').accent).toContain('emerald');
  });

  it('joins classes safely', () => {
    expect(cx('a', false && 'b', null, 'c')).toBe('a c');
  });
});
