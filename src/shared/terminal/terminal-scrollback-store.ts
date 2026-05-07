export interface TerminalScrollbackChunk {
    readonly id: string;
    readonly sessionId: string;
    readonly lines: readonly string[];
    readonly createdAt: number;
}

export interface TerminalScrollbackStore {
    readonly chunks: readonly TerminalScrollbackChunk[];
}

/**
 * Creates an empty scrollback store.
 *
 * @returns Empty scrollback store.
 *
 * @example
 * ```ts
 * createTerminalScrollbackStore()
 * ```
 */
export function createTerminalScrollbackStore(): TerminalScrollbackStore {
    return {chunks: []};
}

/**
 * Appends a bounded scrollback chunk.
 *
 * @param store - Current scrollback store.
 * @param chunk - Next scrollback chunk.
 * @param maxChunks - Maximum chunks to keep.
 * @returns Updated scrollback store.
 *
 * @example
 * ```ts
 * appendTerminalScrollbackChunk(store, chunk)
 * ```
 */
export function appendTerminalScrollbackChunk(
    store: TerminalScrollbackStore,
    chunk: TerminalScrollbackChunk,
    maxChunks = 1000,
): TerminalScrollbackStore {
    return {
        chunks: [...store.chunks, chunk].slice(-maxChunks),
    };
}
