import { describe, expect, it } from 'vitest';
import { createTerminalReplayTimeline } from '../src/shared/terminal/terminal-replay-timeline';

describe('terminal replay timeline', () => {
  it('creates replay frames from semantic snapshots', () => {
    const timeline = createTerminalReplayTimeline({
      lines: ['ok', 'Error: boom'],
      markers: [{ id: 'error:1', type: 'error', value: 'Error: boom', line: 1 }],
    }, 100);

    expect(timeline.frames).toHaveLength(2);
    expect(timeline.totalMarkers).toBe(1);
  });
});
