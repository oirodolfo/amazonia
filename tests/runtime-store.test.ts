import { describe, expect, it } from 'vitest';
import { createWorkbenchRuntimeStore } from '../src/shared/runtime/workbench-runtime-store';

describe('runtime store', () => {
  it('publishes runtime events', () => {
    const store = createWorkbenchRuntimeStore();

    store.publish({
      id: '1',
      type: 'terminal.output',
      timestamp: 1,
      payload: {},
    });

    expect(store.events).toHaveLength(1);
  });
});
