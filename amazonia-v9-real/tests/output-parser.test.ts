import { describe, expect, it } from 'vitest';
import { parseDiagnostics, parseFriendlyOutput } from '@/output';
import type { RunRecord } from '@/shared';

const run: RunRecord = {
  id: 'run-one',
  actionId: 'action-one',
  command: 'pnpm test',
  cwd: '/repo',
  startedAtIso: '2026-01-01T00:00:00.000Z',
  endedAtIso: '2026-01-01T00:00:01.000Z',
  durationMs: 1000,
  exitCode: 1,
  status: 'failed',
};

describe('output parser', () => {
  it('extracts warning and error diagnostics', () => {
    const diagnostics = parseDiagnostics('warning src/app.ts:10:2 deprecated\nerror src/main.ts:3 failed');
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics[0]?.level).toBe('warning');
    expect(diagnostics[1]?.filePath).toBe('src/main.ts');
  });

  it('creates friendly output cards with links', () => {
    const card = parseFriendlyOutput(run, ['error src/app.ts:1:1 failed https://example.com']);
    expect(card.links).toEqual(['https://example.com']);
    expect(card.status).toBe('failed');
    expect(card.diagnostics[0]?.level).toBe('error');
  });
});
