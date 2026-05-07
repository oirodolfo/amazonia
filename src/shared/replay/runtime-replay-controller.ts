export interface RuntimeReplayPlaybackState {
  readonly currentFrame: number;
  readonly speed: number;
  readonly paused: boolean;
}

export interface RuntimeReplayController {
  readonly state: RuntimeReplayPlaybackState;
  play(): void;
  pause(): void;
  seek(frame: number): void;
  setSpeed(speed: number): void;
}

/**
 * Creates the replay playback controller used by timeline replay.
 *
 * @returns Runtime replay controller.
 *
 * @example
 * ```ts
 * const replay = createRuntimeReplayController()
 * ```
 */
export function createRuntimeReplayController(): RuntimeReplayController {
  let state: RuntimeReplayPlaybackState = {
    currentFrame: 0,
    speed: 1,
    paused: true,
  };

  return {
    get state() {
      return state;
    },

    play() {
      state = {
        ...state,
        paused: false,
      };
    },

    pause() {
      state = {
        ...state,
        paused: true,
      };
    },

    seek(frame) {
      state = {
        ...state,
        currentFrame: Math.max(0, frame),
      };
    },

    setSpeed(speed) {
      state = {
        ...state,
        speed: Math.max(0.25, speed),
      };
    },
  };
}
