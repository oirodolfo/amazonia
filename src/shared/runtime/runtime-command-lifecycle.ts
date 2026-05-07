import type {
  RuntimeCommandLifecycle,
  RuntimeDiagnosticMarker,
} from './runtime-intelligence-types';

/**
 * Creates a runtime command lifecycle state.
 *
 * @param input - Lifecycle metadata.
 * @returns Runtime lifecycle.
 *
 * @example
 * ```ts
 * createRuntimeCommandLifecycle({ command: 'pnpm dev', cwd: '/repo', startedAt: Date.now() })
 * ```
 */
export function createRuntimeCommandLifecycle(input: {
  readonly command: string;
  readonly cwd: string;
  readonly startedAt: number;
}): RuntimeCommandLifecycle {
  return {
    id: `runtime:${input.startedAt}:${input.command}`,
    command: input.command,
    cwd: input.cwd,
    startedAt: input.startedAt,
    finishedAt: null,
    exitCode: null,
    durationMs: null,
    stdoutLines: [],
    stderrLines: [],
    diagnostics: [],
  };
}

/**
 * Appends stdout/stderr lines incrementally.
 *
 * @param lifecycle - Current lifecycle.
 * @param input - Stream payload.
 * @returns Updated lifecycle.
 *
 * @example
 * ```ts
 * appendRuntimeOutput(lifecycle, { stream: 'stdout', lines: ['hello'] })
 * ```
 */
export function appendRuntimeOutput(
  lifecycle: RuntimeCommandLifecycle,
  input: {
    readonly stream: 'stdout' | 'stderr';
    readonly lines: readonly string[];
  },
): RuntimeCommandLifecycle {
  return {
    ...lifecycle,
    stdoutLines: input.stream === 'stdout'
      ? [...lifecycle.stdoutLines, ...input.lines].slice(-5000)
      : lifecycle.stdoutLines,
    stderrLines: input.stream === 'stderr'
      ? [...lifecycle.stderrLines, ...input.lines].slice(-5000)
      : lifecycle.stderrLines,
  };
}

/**
 * Attaches runtime diagnostics to a lifecycle.
 *
 * @param lifecycle - Runtime lifecycle.
 * @param diagnostics - Runtime diagnostics.
 * @returns Updated lifecycle.
 *
 * @example
 * ```ts
 * attachRuntimeDiagnostics(lifecycle, diagnostics)
 * ```
 */
export function attachRuntimeDiagnostics(
  lifecycle: RuntimeCommandLifecycle,
  diagnostics: readonly RuntimeDiagnosticMarker[],
): RuntimeCommandLifecycle {
  return {
    ...lifecycle,
    diagnostics,
  };
}

/**
 * Finalizes runtime lifecycle timing.
 *
 * @param lifecycle - Runtime lifecycle.
 * @param input - Exit metadata.
 * @returns Updated lifecycle.
 *
 * @example
 * ```ts
 * finishRuntimeLifecycle(lifecycle, { exitCode: 0, finishedAt: Date.now() })
 * ```
 */
export function finishRuntimeLifecycle(
  lifecycle: RuntimeCommandLifecycle,
  input: {
    readonly exitCode: number;
    readonly finishedAt: number;
  },
): RuntimeCommandLifecycle {
  return {
    ...lifecycle,
    exitCode: input.exitCode,
    finishedAt: input.finishedAt,
    durationMs: Math.max(0, input.finishedAt - lifecycle.startedAt),
  };
}
