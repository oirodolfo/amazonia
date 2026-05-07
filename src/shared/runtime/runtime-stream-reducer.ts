export interface RuntimeStreamChunk {
  readonly id: string;
  readonly text: string;
  readonly createdAt: number;
}

export interface RuntimeStreamState {
  readonly chunks: readonly RuntimeStreamChunk[];
}

const MAX_STREAM_CHUNKS = 1500;

/**
 * Creates stream state optimized for incremental rendering.
 *
 * @returns Empty stream state.
 *
 * @example
 * ```ts
 * createRuntimeStreamState()
 * ```
 */
export function createRuntimeStreamState(): RuntimeStreamState {
  return {
    chunks: [],
  };
}

/**
 * Incrementally appends stream chunks using a bounded ring-buffer style reducer.
 *
 * @param state - Stream state.
 * @param chunk - Stream chunk.
 * @returns Updated stream state.
 *
 * @example
 * ```ts
 * appendRuntimeStreamChunk(state, chunk)
 * ```
 */
export function appendRuntimeStreamChunk(
  state: RuntimeStreamState,
  chunk: RuntimeStreamChunk,
): RuntimeStreamState {
  return {
    chunks: [...state.chunks, chunk].slice(-MAX_STREAM_CHUNKS),
  };
}
