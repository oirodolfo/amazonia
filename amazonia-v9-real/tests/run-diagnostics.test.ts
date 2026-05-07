import { describe, expect, it } from 'vitest';
import { summarizeRunHealth } from '@/runs/run-diagnostics';
import type { FriendlyOutputCard } from '@/shared/types';

const baseCard: FriendlyOutputCard = {
  id: 'card-1',
  runId: 'run-1',
  command: 'pnpm test',
  cwd: '/repo',
  status: 'failed',
  exitCode: 1,
  diagnostics: [{ level: 'error', message: 'boom' }],
  links: ['src/index.ts:1:1'],
};

describe('run diagnostics', () => {
  it('creates an attention score from diagnostics', () => {
    const summary = summarizeRunHealth(baseCard);

    expect(summary.errorCount).toBe(1);
    expect(summary.score).toBeLessThan(100);
    expect(summary.headline).toContain('error');
  });
});
