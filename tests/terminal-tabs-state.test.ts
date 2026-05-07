import { describe, expect, it } from 'vitest';
import { emptyTerminalTabsState, terminalTabsReducer } from '../src/renderer/terminal/terminal-tabs-state';
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

describe('terminalTabsReducer', () => {
  it('adds a session and makes it active', () => {
    const state = terminalTabsReducer(emptyTerminalTabsState, {
      type: 'session.upserted',
      session,
    });

    expect(state.sessions).toHaveLength(1);
    expect(state.activeSessionId).toBe('term-1');
  });

  it('closes a session', () => {
    const state = terminalTabsReducer(
      terminalTabsReducer(emptyTerminalTabsState, { type: 'session.upserted', session }),
      { type: 'session.closed', sessionId: 'term-1' },
    );

    expect(state.sessions).toHaveLength(0);
    expect(state.activeSessionId).toBeNull();
  });
});
