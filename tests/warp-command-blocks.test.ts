import { describe, expect, it } from 'vitest';
import {
  appendWarpCommandOutput,
  createWarpCommandBlockState,
  finishWarpCommandBlock,
  startWarpCommandBlock,
} from '../src/shared/terminal/warp-command-blocks';

describe('warp command blocks', () => {
  it('groups output into command blocks', () => {
    const started = startWarpCommandBlock(createWarpCommandBlockState(), {
      sessionId: 'term',
      command: 'pnpm dev',
      cwd: '/repo',
      startedAt: 1,
    });

    const withOutput = appendWarpCommandOutput(started, {
      sessionId: 'term',
      raw: 'error src/index.ts',
    });

    const finished = finishWarpCommandBlock(withOutput, {
      sessionId: 'term',
      exitCode: 1,
      finishedAt: 10,
    });

    expect(finished.blocks[0]?.status).toBe('error');
    expect(finished.blocks[0]?.durationMs).toBe(9);
  });
});
