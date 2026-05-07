import { describe, expect, it } from 'vitest';
import { appendLayoutHistory, normalizeLayoutState } from '@/persistence/layout-history';

describe('layout history', () => {
  it('normalizes broken layout values', () => {
    const layout = normalizeLayoutState({ sidebarSize: 1, terminalSize: 1, outputSize: 1 });

    expect(Math.round(layout.sidebarSize + layout.terminalSize + layout.outputSize)).toBe(100);
  });

  it('keeps a bounded history', () => {
    const history = appendLayoutHistory([], { sidebarSize: 22, terminalSize: 52, outputSize: 26 }, 'resize', 1);

    expect(history).toHaveLength(1);
  });
});
