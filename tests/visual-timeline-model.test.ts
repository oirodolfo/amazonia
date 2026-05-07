import { describe, expect, it } from 'vitest';
import { buildVisualTimelineModel, resolveTimelineSeverity } from '../src/shared/timeline/visual-timeline-model';
import type { RunTimelineEvent } from '../src/shared/timeline/run-timeline';

const baseEvent: RunTimelineEvent = { id: 'e1', runId: 'run-1', type: 'command-started', label: 'started', timestamp: 100, durationMs: null, metadata: { command: 'pnpm dev' } };

describe('visual timeline model', () => {
  it('builds scaled lanes', () => {
    const model = buildVisualTimelineModel([baseEvent, { ...baseEvent, id: 'e2', type: 'command-finished', label: 'done', timestamp: 300 }]);
    expect(model.lanes).toHaveLength(1);
    expect(model.lanes[0]?.label).toBe('pnpm dev');
    expect(model.lanes[0]?.widthPercent).toBeGreaterThan(0);
  });

  it('resolves error severity first', () => {
    expect(resolveTimelineSeverity([{ ...baseEvent, type: 'output-error' }])).toBe('error');
  });
});
