import { describe, expect, it } from 'vitest';
import { createRunTimelineEvent, groupTimelineByRun } from '../src/shared/timeline/run-timeline';

describe('run timeline', () => {
  it('groups events by run', () => {
    const event = createRunTimelineEvent({ runId: 'run-1', type: 'queued', label: 'Queued' });
    const grouped = groupTimelineByRun([event]);

    expect(grouped['run-1']).toHaveLength(1);
  });
});
