import { describe, expect, it } from 'vitest';
import { createTerminalSessionSnapshot, updateTerminalSession } from '../src/shared/runtime/runtime-types';

describe('runtime terminal snapshots', () => {
  it('creates normalized snapshots', () => {
    const snapshot = createTerminalSessionSnapshot({
      title: 'dev',
      cwd: '/repo',
      runtime: 'electron',
    });

    expect(snapshot.title).toBe('dev');
    expect(snapshot.status).toBe('created');
    expect(snapshot.size.cols).toBeGreaterThan(0);
  });

  it('updates snapshots immutably', () => {
    const snapshot = createTerminalSessionSnapshot({
      title: 'dev',
      cwd: '/repo',
      runtime: 'web',
    });

    const updated = updateTerminalSession(snapshot, { status: 'running' });

    expect(updated.status).toBe('running');
    expect(snapshot.status).toBe('created');
  });
});
