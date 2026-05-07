import { describe, expect, it, vi } from 'vitest';
import { createIntegratedRuntimeStore } from '../src/shared/runtime/integrated-runtime-store';

describe('createIntegratedRuntimeStore', () => {
  it('publishes terminal frames and persists sections', () => {
    const repository = {
      saveTerminalSection: vi.fn(),
      saveEvent: vi.fn(),
      saveRun: vi.fn(),
      listEvents: vi.fn(() => []),
      saveDiagnostic: vi.fn(),
      saveGraphSnapshot: vi.fn(),
    };

    const store = createIntegratedRuntimeStore(repository);

    store.publishTerminalData({
      sessionId: 'term-1',
      data: 'error src/index.ts\n',
      receivedAt: 1,
    });

    expect(store.state.terminalFrames['term-1']).toHaveLength(1);
    expect(repository.saveTerminalSection).toHaveBeenCalled();
    expect(repository.saveEvent).toHaveBeenCalled();
  });
});
