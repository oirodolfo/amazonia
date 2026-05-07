export interface TimelineAnimationFrame {
  readonly id: string;
  readonly timestamp: number;
  readonly progress: number;
}

export interface TimelinePlaybackState {
  readonly frames: readonly TimelineAnimationFrame[];
  readonly currentFrameIndex: number;
  readonly speed: number;
  readonly isPlaying: boolean;
}

/**
 * Creates a timeline playback state.
 *
 * @param frames - Timeline frames.
 * @returns Playback state.
 *
 * @example
 * ```ts
 * createTimelinePlaybackState(frames)
 * ```
 */
export function createTimelinePlaybackState(
  frames: readonly TimelineAnimationFrame[],
): TimelinePlaybackState {
  return {
    frames,
    currentFrameIndex: 0,
    speed: 1,
    isPlaying: false,
  };
}

/**
 * Advances playback state.
 *
 * @param state - Playback state.
 * @returns Updated playback state.
 *
 * @example
 * ```ts
 * advanceTimelinePlayback(state)
 * ```
 */
export function advanceTimelinePlayback(
  state: TimelinePlaybackState,
): TimelinePlaybackState {
  return {
    ...state,
    currentFrameIndex: Math.min(
      state.frames.length - 1,
      state.currentFrameIndex + 1,
    ),
  };
}
