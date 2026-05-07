import { describe, expect, it } from 'vitest';
import { recoverTerminalSessions, TerminalOrchestrator } from '../src/terminal';

describe('recoverTerminalSessions', () => {
  it('marks previously running sessions as suspended and respawnable', () => {
    const orchestrator = new TerminalOrchestrator();
    const [recovered] = recoverTerminalSessions(orchestrator, [
      { id: 'tab', title: 'dev', cwd: '/repo', command: 'pnpm dev', createdAtIso: '2026-01-01T00:00:00.000Z', status: 'running' },
    ]);

    expect(recovered?.shouldRespawn).toBe(true);
    expect(recovered?.snapshot.status).toBe('suspended');
  });
});
