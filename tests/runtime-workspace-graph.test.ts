import { describe, expect, it } from 'vitest';
import { createRuntimeWorkspaceGraph } from '../src/shared/runtime/runtime-workspace-graph';

describe('runtime workspace graph', () => {
  it('creates graph nodes from runtime lifecycles', () => {
    const graph = createRuntimeWorkspaceGraph([{
      id: 'runtime',
      command: 'pnpm dev',
      cwd: '/repo',
      startedAt: 1,
      finishedAt: null,
      exitCode: null,
      durationMs: null,
      stdoutLines: [],
      stderrLines: [],
      diagnostics: [{
        id: 'error',
        line: 1,
        severity: 'error',
        message: 'boom',
      }],
    }]);

    expect(graph.nodes.length).toBeGreaterThan(1);
    expect(graph.edges).toHaveLength(1);
  });
});
