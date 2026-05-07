import { describe, expect, it } from 'vitest';
import type { UseXTermAddonControllerInput } from '../src/renderer/terminal/addons/use-xterm-addon-controller';

describe('useXTermAddonController types', () => {
  it('accepts partial addon flags', () => {
    const input: UseXTermAddonControllerInput = {
      flags: {
        webgl: false,
      },
    };

    expect(input.flags?.webgl).toBe(false);
  });
});
