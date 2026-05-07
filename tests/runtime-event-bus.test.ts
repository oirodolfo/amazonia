import { describe, expect, it, vi } from 'vitest';
import { createRuntimeEventBus } from '../src/shared/runtime/runtime-event-bus';

describe('runtime event bus', () => {
  it('publishes runtime events', () => {
    const bus = createRuntimeEventBus();
    const listener = vi.fn();

    bus.subscribe('runtime:test', listener);

    bus.publish({
      id: '1',
      type: 'runtime:test',
      createdAt: 1,
      payload: {
        ok: true,
      },
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
