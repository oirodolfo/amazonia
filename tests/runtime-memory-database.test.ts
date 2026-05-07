import { describe, expect, it } from 'vitest';
import { createRuntimeMemoryDatabase } from '../src/shared/runtime/runtime-memory-database';

describe('runtime memory database', () => {
  it('stores runtime snapshots', () => {
    const db = createRuntimeMemoryDatabase();

    db.save({
      id: 'snapshot',
      createdAt: 1,
      snapshot: {
        createdAt: 1,
        events: [],
      },
    });

    expect(db.list()).toHaveLength(1);
    expect(db.get('snapshot')?.id).toBe('snapshot');
  });
});
