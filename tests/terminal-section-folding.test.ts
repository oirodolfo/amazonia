import { describe, expect, it } from 'vitest';
import { createTerminalSections, toggleFoldedSection } from '../src/shared/terminal/terminal-section-folding';

describe('terminal section folding', () => {
  it('creates semantic sections', () => {
    const sections = createTerminalSections(['$ pnpm build', 'compiling', 'error boom']);

    expect(sections.length).toBeGreaterThan(0);
    expect(sections.some((section) => section.severity === 'error')).toBe(true);
  });

  it('toggles folded section ids', () => {
    expect(toggleFoldedSection([], 'a')).toEqual(['a']);
    expect(toggleFoldedSection(['a'], 'a')).toEqual([]);
  });
});
