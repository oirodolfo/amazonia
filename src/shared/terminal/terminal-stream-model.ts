import { parseSemanticTerminalLine, type SemanticTerminalToken } from '@/shared/terminal/semantic-terminal-parser';
import { createTerminalSections, type TerminalSection } from '@/shared/terminal/terminal-section-folding';

export interface TerminalStreamFrame {
  readonly sessionId: string;
  readonly raw: string;
  readonly receivedAt: number;
  readonly lines: readonly string[];
  readonly tokens: readonly SemanticTerminalToken[];
  readonly sections: readonly TerminalSection[];
}

/**
 * Converts raw terminal data into structured lines, semantic tokens and foldable sections.
 *
 * @param input - Terminal stream frame input.
 * @returns Structured terminal stream frame.
 *
 * @example
 * ```ts
 * createTerminalStreamFrame({ sessionId: 'term', raw: 'error src/a.ts', receivedAt: 1 })
 * ```
 */
export function createTerminalStreamFrame(input: {
  readonly sessionId: string;
  readonly raw: string;
  readonly receivedAt: number;
}): TerminalStreamFrame {
  const lines = input.raw.split(/\r?\n/).filter((line) => line.length > 0);
  const tokens = lines.flatMap((line) => parseSemanticTerminalLine(line));
  const sections = createTerminalSections(lines);

  return {
    sessionId: input.sessionId,
    raw: input.raw,
    receivedAt: input.receivedAt,
    lines,
    tokens,
    sections,
  };
}

/**
 * Appends terminal frames while keeping memory bounded.
 *
 * @param frames - Existing frames.
 * @param next - Next frame.
 * @param maxFrames - Max frames to keep.
 * @returns Bounded frame list.
 *
 * @example
 * ```ts
 * appendTerminalStreamFrame([], frame, 100)
 * ```
 */
export function appendTerminalStreamFrame(
  frames: readonly TerminalStreamFrame[],
  next: TerminalStreamFrame,
  maxFrames = 500,
): TerminalStreamFrame[] {
  return [...frames, next].slice(-maxFrames);
}
