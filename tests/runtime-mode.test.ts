import { describe, expect, it } from 'vitest';
import { resolveRuntimeCapabilities } from '../src/runtime';

describe('runtime capabilities', () => {
  it('uses ipc when the Electron bridge exists', () => {
    expect(resolveRuntimeCapabilities(true).transport).toBe('ipc');
  });

  it('uses websocket in browser mode', () => {
    expect(resolveRuntimeCapabilities(false).transport).toBe('websocket');
  });
});
