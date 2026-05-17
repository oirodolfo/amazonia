import { describe, expect, it, vi } from 'vitest';
import { runWorkbenchAction } from '../src/renderer/actions/run-action-controller';
import { emptyWorkbenchStoreSnapshot } from '../src/shared/persistence/workbench-store';
import type { WorkspaceAction } from '../src/shared/actions/action-types';
import type { WorkbenchTerminalClient } from '../src/renderer/terminal/workbench-terminal-client';
import type { TerminalSessionSnapshot } from '../src/shared/runtime/runtime-types';

const action: WorkspaceAction = {
  id: 'action-1',
  packageId: 'pkg-1',
  packageName: '@curupira-labs/pkg',
  label: 'dev',
  command: 'pnpm dev',
  cwd: '/repo/packages/pkg',
  kind: 'script',
  weight: 1,
};

describe('runWorkbenchAction', () => {
  it('runs the action and increments usage frequency', async () => {
    const terminalClient: WorkbenchTerminalClient = {
      runtime: 'electron',
      runAction: vi.fn(async (): Promise<TerminalSessionSnapshot> => ({
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
