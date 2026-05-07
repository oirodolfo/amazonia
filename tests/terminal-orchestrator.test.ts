import { describe, expect, it } from 'vitest';
import { TerminalOrchestrator } from '../src/terminal/orchestrator';

describe('TerminalOrchestrator', () => {
  it('creates, patches and lists sessions by activity', () => {
    const orchestrator = new TerminalOrchestrator();
    orchestrator.create({ id: 'one', title: 'one', cwd: '/repo', createdAtIso: '2026-01-01T00:00:00.000Z' });
    orchestrator.patch('one', { status: 'running', outputBytesDelta: 42, nowIso: '2026-01-01T00:00:01.000Z' });

    expect(orchestrator.list()[0]?.status).toBe('running');
    expect(orchestrator.list()[0]?.outputBytes).toBe(42);
  });

  it('maps crashed sessions back to exited renderer tabs', () => {
    const orchestrator = new TerminalOrchestrator();
    orchestrator.create({ id: 'two', title: 'two', cwd: '/repo' });
    orchestrator.patch('two', { status: 'crashed', lastExitCode: 1 });

    expect(orchestrator.toTabs()[0]?.status).toBe('exited');
  });
});
