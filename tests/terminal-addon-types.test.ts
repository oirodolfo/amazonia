import { describe, expect, it } from 'vitest';
import type { TerminalAddonLoadResult } from '../src/shared/terminal/addons/terminal-addon-types';

describe('terminal addon types', () => {
  it('models load results', () => {
    const result: TerminalAddonLoadResult = {
      id: 'fit',
      status: 'loaded',
      reason: null,
    };

    expect(result.status).toBe('loaded');
  });
});
