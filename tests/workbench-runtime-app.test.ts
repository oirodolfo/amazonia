import { describe, expect, it, vi } from 'vitest';
import { createWorkbenchRuntimeApp } from '../src/renderer/workbench/workbench-runtime-app';
import { emptyPersistedWorkbenchState } from '../src/shared/persistence/persistence-types';
import type { PersistedWorkbenchState } from '../src/shared/persistence/persistence-types';
import type { TerminalSessionSnapshot } from '../src/shared/runtime/runtime-types';
import type { WorkbenchTerminalClient } from '../src/renderer/terminal/workbench-terminal-client';

describe('createWorkbenchRuntimeApp', () => {
  it('hydrates persisted terminal sessions', async () => {
    const terminalClient: WorkbenchTerminalClient = {
      runtime: 'electron',
      runAction: vi.fn(),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    };

    const persisted: PersistedWorkbenchState = {
      ...emptyPersistedWorkbenchState,
      terminalSessions: [{
        id: 'term-1',
        title: 'dev',
        cwd: '/repo',
        command: 'pnpm dev',
        runtime: 'electron',
        status: 'running',
        size: { cols: 120, rows: 32 },
        createdAt: 1,
        updatedAt: 1,
        exitCode: null,
      } satisfies TerminalSessionSnapshot],
    };

    const app = createWorkbenchRuntimeApp({
      runtime: 'electron',
      terminalClient,
      loadState: vi.fn(async () => persisted),
      saveState: vi.fn(async () => true),
    });

    await app.hydrate();

    expect(app.getState().terminalTabs.sessions).toHaveLength(1);
  });
});
