import { describe, expect, it } from 'vitest';
import { MemoryWorkbenchHistoryStore } from '../src/persistence/repositories';

describe('MemoryWorkbenchHistoryStore', () => {
  it('stores layout, runs and terminal tabs', () => {
    const store = new MemoryWorkbenchHistoryStore();
    store.saveLayout({ sidebarSize: 20, terminalSize: 50, outputSize: 30 });
    store.saveRun({ id: 'run', actionId: 'action', command: 'pnpm test', cwd: '/repo', startedAtIso: '2026-01-01T00:00:00.000Z', status: 'running' });
    store.saveTerminalTab({ id: 'tab', title: 'test', cwd: '/repo', createdAtIso: '2026-01-01T00:00:00.000Z', status: 'running' });

    expect(store.readLayout()?.terminalSize).toBe(50);
    expect(store.listRuns(1)).toHaveLength(1);
    expect(store.listTerminalTabs()).toHaveLength(1);
  });
});
