import { describe, expect, it, vi } from 'vitest';
import { createWorkbenchAutosave } from '../src/renderer/workbench/workbench-autosave';

describe('createWorkbenchAutosave', () => {
  it('flushes pending state', async () => {
    const persist = vi.fn(async () => undefined);
    const autosave = createWorkbenchAutosave({ persist }, 1);

    autosave.schedule();
    await autosave.flush();

    expect(persist).toHaveBeenCalled();
  });
});
