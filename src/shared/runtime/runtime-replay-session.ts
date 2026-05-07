import type { RuntimeReplayFrame } from './runtime-replay-engine';

export interface RuntimeReplaySession {
  readonly id: string;
  readonly frames: readonly RuntimeReplayFrame[];
  readonly currentFrameIndex: number;
  readonly isPlaying: boolean;
}

/**
 * Creates a replay session.
 *
 * @param input - Replay session data.
 * @returns Replay session.
 *
 * @example
 * ```ts
 * createRuntimeReplaySession({...})
 * ```
 */
export function createRuntimeReplaySession(input: RuntimeReplaySession): RuntimeReplaySession {
  return input;
}
