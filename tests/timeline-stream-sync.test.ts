import { describe, expect, it } from 'vitest';
import { terminalFrameToTimelineEvent, terminalStatusToTimelineEvent } from '../src/shared/timeline/timeline-stream-sync';

describe('timeline stream sync', () => {
  it('creates error events from terminal frames', () => {
    const event = terminalFrameToTimelineEvent({ sessionId: 'term', data: 'error boom', receivedAt: 10 });

    expect(event?.type).toBe('output-error');
  });

  it('creates status events from terminal snapshots', () => {
    const event = terminalStatusToTimelineEvent({
      id: 'term',
      title: 'dev',
      cwd: '/repo',
      command: 'pnpm dev',
      runtime: 'electron',
      status: 'exited',
      size: { cols: 120, rows: 32 },
      createdAt: 1,
      updatedAt: 2,
      exitCode: 0,
    });

    expect(event.type).toBe('command-finished');
  });
});
