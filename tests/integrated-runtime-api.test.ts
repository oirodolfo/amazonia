import { describe, expect, it, vi } from 'vitest';
import { createIntegratedRuntimeApi } from '../src/preload/integrated-runtime-api';

describe('createIntegratedRuntimeApi', () => {
  it('routes runtime calls through IPC', async () => {
    const invoke = vi.fn(async () => ({ events: [], terminalFrames: {} }));
    const api = createIntegratedRuntimeApi({
      invoke,
      on: vi.fn(),
      removeListener: vi.fn(),
    });

    await api.getState();

    expect(invoke).toHaveBeenCalledWith('workbench:runtime:get-state');
  });
});
