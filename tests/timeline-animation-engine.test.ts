import { describe, expect, it } from 'vitest';
import {
  advanceTimelinePlayback,
  createTimelinePlaybackState,
} from '../src/shared/timeline/timeline-animation-engine';

describe('timeline animation engine', () => {
  it('advances playback', () => {
    const state = createTimelinePlaybackState([
      {
        id: 'f1',
        timestamp: 1,
        progress: 0,
      },
      {
        id: 'f2',
        timestamp: 2,
        progress: 1,
      },
    ]);

    const next = advanceTimelinePlayback(state);

    expect(next.currentFrameIndex).toBe(1);
  });
});
