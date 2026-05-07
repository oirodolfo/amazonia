import { describe, expect, it } from 'vitest';
import {
  appendRuntimeOutput,
  attachRuntimeDiagnostics,
  createRuntimeCommandLifecycle,
  finishRuntimeLifecycle,
} from '../src/shared/runtime/runtime-command-lifecycle';

describe('runtime command lifecycle', () => {
  it('tracks runtime lifecycle state', () => {
    const lifecycle = createRuntimeCommandLifecycle({
      command: 'pnpm dev',
      cwd: '/repo',
      startedAt: 1,
    });

    const withOutput = appendRuntimeOutput(lifecycle, {
      stream: 'stdout',
      lines: ['hello'],
    });

    const withDiagnostics = attachRuntimeDiagnostics(withOutput, [{
      id: 'error',
      line: 1,
      severity: 'error',
      message: 'boom',
    }]);

    const finished = finishRuntimeLifecycle(withDiagnostics, {
      exitCode: 1,
      finishedAt: 10,
    });

    expect(finished.durationMs).toBe(9);
    expect(finished.diagnostics).toHaveLength(1);
  });
});
