import { describe, expect, it } from 'vitest';
import type { RuntimeRunPersistenceRecord } from '../src/shared/runtime/runtime-persistence-types';

describe('runtime persistence types', () => {
  it('supports runtime run records', () => {
    const record: RuntimeRunPersistenceRecord = {
      id: 'run-1',
      command: 'pnpm dev',
      cwd: '/repo',
      status: 'running',
      startedAt: 1,
      finishedAt: null,
      exitCode: null,
    };

    expect(record.command).toBe('pnpm dev');
  });
});
