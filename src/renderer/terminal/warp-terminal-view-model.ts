import {
    appendWarpCommandOutput,
    createWarpCommandBlockState,
    finishWarpCommandBlock,
    startWarpCommandBlock,
    type WarpCommandBlockState,
} from '@/shared/terminal/warp-command-blocks';
import type {TerminalDataFrame, TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';

export interface WarpTerminalViewModel {
    readonly session: TerminalSessionSnapshot;
    readonly blocks: WarpCommandBlockState;
    readonly searchQuery: string;
    readonly matchedLineCount: number;
}

/**
 * Creates a Warp-like terminal view model.
 *
 * @param session - Terminal session.
 * @returns Terminal view model.
 */
export function createWarpTerminalViewModel(session: TerminalSessionSnapshot): WarpTerminalViewModel {
    return {
        session,
        blocks: createWarpCommandBlockState(),
        searchQuery: '',
        matchedLineCount: 0,
    };
}

/**
 * Starts a command block in the view model.
 *
 * @param model - Terminal model.
 * @param command - Command string.
 * @returns Updated model.
 */
export function startWarpTerminalCommand(model: WarpTerminalViewModel, command: string): WarpTerminalViewModel {
    return {
        ...model,
        blocks: startWarpCommandBlock(model.blocks, {
            sessionId: model.session.id,
            command,
            cwd: model.session.cwd,
            startedAt: Date.now(),
        }),
    };
}

/**
 * Applies terminal data to the view model.
 *
 * @param model - Terminal model.
 * @param frame - Terminal frame.
 * @returns Updated model.
 */
export function applyWarpTerminalData(model: WarpTerminalViewModel, frame: TerminalDataFrame): WarpTerminalViewModel {
    if (frame.sessionId !== model.session.id) return model;
    return {
        ...model,
        blocks: appendWarpCommandOutput(model.blocks, {sessionId: frame.sessionId, raw: frame.data}),
    };
}

/**
 * Searches the terminal model.
 *
 * @param model - Terminal model.
 * @param query - Search query.
 * @returns Updated model.
 */
export function searchWarpTerminal(model: WarpTerminalViewModel, query: string): WarpTerminalViewModel {
    const normalized = query.trim().toLowerCase();
    const matchedLineCount = normalized
        ? model.blocks.blocks.flatMap((block) => block.rawLines).filter((line) => line.toLowerCase().includes(normalized)).length
        : 0;
    return {...model, searchQuery: query, matchedLineCount};
}

/**
 * Finishes the active command block.
 *
 * @param model - Terminal model.
 * @param snapshot - Terminal snapshot.
 * @returns Updated model.
 */
export function finishWarpTerminalSession(model: WarpTerminalViewModel, snapshot: TerminalSessionSnapshot): WarpTerminalViewModel {
    if (snapshot.id !== model.session.id) return model;
    return {
        ...model,
        session: snapshot,
        blocks: finishWarpCommandBlock(model.blocks, {
            sessionId: snapshot.id,
            exitCode: snapshot.exitCode,
            finishedAt: snapshot.updatedAt,
        }),
    };
}
