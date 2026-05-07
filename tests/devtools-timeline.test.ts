import { describe, expect, it } from 'vitest';
import { createDevtoolsTimeline } from '../src/timeline';

describe('createDevtoolsTimeline', () => {
  it('groups events into deterministic lanes', () => {
    const snapshot = createDevtoolsTimeline([
      { id: 'scan', kind: 'workspace', label: 'scan', startedAtMs: 0, endedAtMs: 12 },
      { id: 'run', kind: 'action', label: 'test', startedAtMs: 12, endedAtMs: 32 },
    ]);

    expect(snapshot.totalDurationMs).toBe(32);
    expect(snapshot.lanes.map((lane) => lane.kind)).toEqual(['workspace', 'action']);
  });
});
