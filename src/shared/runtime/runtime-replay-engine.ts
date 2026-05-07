import type { RuntimeStoreSnapshot } from './workbench-runtime-store';

export interface RuntimeReplayFrame {
  readonly index: number;
  readonly timestamp: number;
  readonly type: string;
}

export interface RuntimeReplayResult {
  readonly totalFrames: number;
  readonly frames: readonly RuntimeReplayFrame[];
}

/**
 * Builds replay frames from a runtime snapshot.
 *
 * @param snapshot - Runtime snapshot.
 * @returns Replay frames.
 *
 * @example
 * ```ts
 * replayRuntimeSnapshot(snapshot)
 * ```
 */
export function replayRuntimeSnapshot(snapshot: RuntimeStoreSnapshot): RuntimeReplayResult {
  return {
    totalFrames: snapshot.events.length,
    frames: snapshot.events.map((event, index) => ({
      index,
      timestamp: event.timestamp,
      type: event.type,
    })),
  };
}
