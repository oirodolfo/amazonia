import { describe, expect, it } from 'vitest';
import { createReconnectQueue, decideTerminalReconnect } from '@/terminal/reconnect-policy';
import type { TerminalSessionSnapshot } from '@/terminal/orchestrator';

const now = Date.parse('2026-05-04T12:00:00.000Z');
const session: TerminalSessionSnapshot = {
  id: 'tab-1',
  title: 'dev',
  cwd: '/repo',
  command: 'pnpm dev',
  createdAtIso: '2026-05-04T11:59:00.000Z',
  status: 'running',
  lastActivityAtIso: '2026-05-04T11:59:30.000Z',
  outputBytes: 42,
};

describe('terminal reconnect policy', () => {
  it('reconnects running sessions', () => {
    expect(decideTerminalReconnect(session, now).shouldReconnect).toBe(true);
  });

  it('creates a reconnect queue', () => {
    expect(createReconnectQueue([session], now)).toHaveLength(1);
  });
});
