import { describe, expect, it, vi } from 'vitest';
import { createWorkbenchController, restoreWorkbenchStore } from '../src/renderer/workbench/workbench-controller';
import { createEmptyWorkbenchState } from '../src/renderer/workbench/workbench-state';
import { emptyWorkbenchStoreSnapshot } from '../src/shared/persistence/workbench-store';
import type { WorkbenchTerminalClient } from '../src/renderer/terminal/workbench-terminal-client';

describe('workbench controller', () => {
  it('restores safe store defaults', () => {
    expect(restoreWorkbenchStore(null).favoriteActionIds).toEqual([]);
  });

  it('creates output cards only when parser finds useful data', () => {
    const dispatch = vi.fn();
    const terminalClient: WorkbenchTerminalClient = {
      runtime: 'electron',
      runAction: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    };

    const controller = createWorkbenchController({
      runtime: 'electron',
      terminalClient,
      getState: () => createEmptyWorkbenchState(emptyWorkbenchStoreSnapshot),
      dispatch,
    });

    controller.handleTerminalOutput('term-1', 'dev', 'src/index.ts:1:2 error boom');

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'output.card.added' }));
  });
});
