import {parseSemanticTerminalLine, type SemanticTerminalToken} from '@/shared/terminal/semantic-terminal-parser';

export type WarpCommandBlockStatus = 'running' | 'success' | 'warning' | 'error' | 'idle';

export interface WarpCommandBlock {
    readonly id: string;
    readonly sessionId: string;
    readonly command: string;
    readonly cwd: string;
    readonly startedAt: number;
    readonly finishedAt: number | null;
    readonly durationMs: number | null;
    readonly status: WarpCommandBlockStatus;
    readonly exitCode: number | null;
    readonly rawLines: readonly string[];
    readonly tokens: readonly SemanticTerminalToken[];
}

export interface WarpCommandBlockState {
    readonly blocks: readonly WarpCommandBlock[];
}

/**
 * Creates the initial Warp-style command block state.
 *
 * @returns Empty command block state.
 *
 * @example
 * ```ts
 * createWarpCommandBlockState()
 * ```
 */
export function createWarpCommandBlockState(): WarpCommandBlockState {
    return {blocks: []};
}

/**
 * Starts a new Warp-style command block.
 *
 * @param state - Current block state.
 * @param input - Command metadata.
 * @returns Updated block state.
 *
 * @example
 * ```ts
 * startWarpCommandBlock(state, { sessionId: 'term', command: 'pnpm dev', cwd: '/repo', startedAt: 1 })
 * ```
 */
export function startWarpCommandBlock(
    state: WarpCommandBlockState,
    input: {
        readonly sessionId: string;
        readonly command: string;
        readonly cwd: string;
        readonly startedAt: number;
    },
): WarpCommandBlockState {
    return {
        blocks: [
            ...state.blocks,
            {
                id: `block:${input.sessionId}:${input.startedAt}:${state.blocks.length}`,
                sessionId: input.sessionId,
                command: input.command,
                cwd: input.cwd,
                startedAt: input.startedAt,
                finishedAt: null,
                durationMs: null,
                status: 'running',
                exitCode: null,
                rawLines: [],
                tokens: [],
            },
        ],
    };
}

/**
 * Appends output to the active command block.
 *
 * @param state - Current block state.
 * @param input - Output input.
 * @returns Updated block state.
 *
 * @example
 * ```ts
 * appendWarpCommandOutput(state, { sessionId: 'term', raw: 'error boom' })
 * ```
 */
export function appendWarpCommandOutput(
    state: WarpCommandBlockState,
    input: { readonly sessionId: string; readonly raw: string },
): WarpCommandBlockState {
    const targetIndex = findActiveBlockIndex(state.blocks, input.sessionId);
    const lines = input.raw.split(/\r?\n/).filter(Boolean);
    const tokens = lines.flatMap((line) => parseSemanticTerminalLine(line));

    if (targetIndex < 0) {
        return appendWarpCommandOutput(
            startWarpCommandBlock(state, {
                sessionId: input.sessionId,
                command: 'interactive shell',
                cwd: '',
                startedAt: Date.now(),
            }),
            input,
        );
    }

    return {
        blocks: state.blocks.map((block, index) => {
            if (index !== targetIndex) return block;

            const nextTokens = [...block.tokens, ...tokens];
            const hasError = nextTokens.some((token) => token.severity === 'error');
            const hasWarning = nextTokens.some((token) => token.severity === 'warning');

            return {
                ...block,
                rawLines: [...block.rawLines, ...lines],
                tokens: nextTokens,
                status: hasError ? 'error' : hasWarning ? 'warning' : block.status,
            };
        }),
    };
}

/**
 * Finishes the active command block.
 *
 * @param state - Current block state.
 * @param input - Exit metadata.
 * @returns Updated block state.
 *
 * @example
 * ```ts
 * finishWarpCommandBlock(state, { sessionId: 'term', exitCode: 0, finishedAt: 10 })
 * ```
 */
export function finishWarpCommandBlock(
    state: WarpCommandBlockState,
    input: { readonly sessionId: string; readonly exitCode: number | null; readonly finishedAt: number },
): WarpCommandBlockState {
    const targetIndex = findActiveBlockIndex(state.blocks, input.sessionId);

    return {
        blocks: state.blocks.map((block, index) => {
            if (index !== targetIndex) return block;

            return {
                ...block,
                finishedAt: input.finishedAt,
                durationMs: Math.max(0, input.finishedAt - block.startedAt),
                exitCode: input.exitCode,
                status: input.exitCode === 0 ? (block.status === 'warning' ? 'warning' : 'success') : 'error',
            };
        }),
    };
}

function findActiveBlockIndex(blocks: readonly WarpCommandBlock[], sessionId: string): number {
    for (let index = blocks.length - 1; index >= 0; index -= 1) {
        if (blocks[index]?.sessionId === sessionId && blocks[index]?.finishedAt === null) {
            return index;
        }
    }
    return -1;
}
