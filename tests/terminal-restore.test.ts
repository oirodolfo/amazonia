import { describe, expect, it } from 'vitest';
import { planTerminalTabRestore } from '../src/renderer/terminal/terminal-restore';
import type { TerminalSessionSnapshot } from '../src/shared/runtime/runtime-types';

const session: TerminalSessionSnapshot = {
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
};

describe('planTerminalTabRestore', () => {
  it('marks running sessions for reconnect', () => {
    const plan = planTerminalTabRestore([session]);

    expect(plan[0]?.shouldReconnect).toBe(true);
  });
});
