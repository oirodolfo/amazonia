import { describe, expect, it } from 'vitest';
import {
  applyWarpTerminalData,
  createWarpTerminalViewModel,
  searchWarpTerminal,
  startWarpTerminalCommand,
} from '../src/renderer/terminal/warp-terminal-view-model';
import type { TerminalSessionSnapshot } from '../src/shared/runtime/runtime-types';

const session: TerminalSessionSnapshot = {
  id: 'term',
  title: 'Terminal',
  cwd: '/repo',
  command: null,
  runtime: 'electron',
  status: 'running',
  size: { cols: 120, rows: 32 },
  createdAt: 1,
  updatedAt: 1,
  exitCode: null,
};

describe('warp terminal view model', () => {
  it('tracks command output and search matches', () => {
    const model = startWarpTerminalCommand(createWarpTerminalViewModel(session), 'pnpm test');
    const withData = applyWarpTerminalData(model, {
      sessionId: 'term',
      data: 'error boom',
      receivedAt: 2,
    });
    const searched = searchWarpTerminal(withData, 'boom');

    expect(searched.blocks.blocks[0]?.rawLines).toContain('error boom');
    expect(searched.matchedLineCount).toBe(1);
  });
});
