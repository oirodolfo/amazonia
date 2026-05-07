import { describe, expect, it } from 'vitest';
import { createRuntimeReplayController } from '../src/shared/replay/runtime-replay-controller';

describe('runtime replay controller', () => {
  it('updates playback state', () => {
    const replay = createRuntimeReplayController();

    replay.play();
    replay.setSpeed(2);
    replay.seek(12);

    expect(replay.state.paused).toBe(false);
    expect(replay.state.speed).toBe(2);
    expect(replay.state.currentFrame).toBe(12);
  });
});
