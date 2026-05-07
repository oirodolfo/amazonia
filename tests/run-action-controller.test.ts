import { describe, expect, it, vi } from 'vitest';
import { runWorkbenchAction } from '../src/renderer/actions/run-action-controller';
import { emptyWorkbenchStoreSnapshot } from '../src/shared/persistence/workbench-store';
import type { WorkspaceAction } from '../src/shared/actions/action-types';
import type { WorkbenchTerminalClient } from '../src/renderer/terminal/workbench-terminal-client';

const action: WorkspaceAction = {
  id: 'action-1',
  packageId: 'pkg-1',
  packageName: '@curupira-labs/pkg',
  packagePath: 'packages/pkg',
  name: 'dev',
  command: 'pnpm dev',
  cwd: '/repo/packages/pkg',
  kind: 'script',
  tool: 'package-json',
  frequency: 0,
  isFavorite: false,
  searchText: 'dev pnpm dev',
};

describe('runWorkbenchAction', () => {
  it('runs the action and increments usage frequency', async () => {
    const terminalClient: WorkbenchTerminalClient = {
      runtime: 'electron',
      runAction: vi.fn(async () => ({
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
      })),
      write: vi.fn(),
      resize: vi.fn(),
      kill: vi.fn(),
    };

    const result = await runWorkbenchAction({
      action,
      runtime: 'electron',
      terminalClient,
      store: emptyWorkbenchStoreSnapshot,
    });

    expect(terminalClient.runAction).toHaveBeenCalled();
    expect(result.nextStore.actionFrequencies[action.id]).toBe(1);
    expect(result.analyticsEvents.map((event) => event.name)).toContain('action.started');
  });
});
