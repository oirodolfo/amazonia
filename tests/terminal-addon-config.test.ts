import { describe, expect, it } from 'vitest';
import {
  createTerminalAddonDescriptors,
  defaultTerminalAddonFeatureFlags,
} from '../src/shared/terminal/addons/terminal-addon-config';

describe('terminal addon config', () => {
  it('creates descriptors for all required addons', () => {
    const descriptors = createTerminalAddonDescriptors(defaultTerminalAddonFeatureFlags);

    expect(descriptors.map((descriptor) => descriptor.id)).toContain('fit');
    expect(descriptors.map((descriptor) => descriptor.id)).toContain('web-links');
    expect(descriptors.map((descriptor) => descriptor.id)).toContain('serialize');
    expect(descriptors).toHaveLength(13);
  });

  it('can disable addons by feature flag', () => {
    const descriptors = createTerminalAddonDescriptors({
      ...defaultTerminalAddonFeatureFlags,
      webgl: false,
    });

    expect(descriptors.find((descriptor) => descriptor.id === 'webgl')?.enabled).toBe(false);
  });
});
