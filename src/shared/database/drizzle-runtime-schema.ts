export interface RuntimeRunEntity {
  readonly id: string;
  readonly command: string;
  readonly cwd: string;
  readonly createdAt: number;
  readonly finishedAt: number | null;
  readonly exitCode: number | null;
}

export interface RuntimeEventEntity {
  readonly id: string;
  readonly runId: string;
  readonly type: string;
  readonly timestamp: number;
  readonly payload: Readonly<Record<string, unknown>>;
}

/**
 * Creates a runtime run entity.
 *
 * @param input - Runtime entity input.
 * @returns Runtime run entity.
 *
 * @example
 * ```ts
 * createRuntimeRunEntity({...})
 * ```
 */
export function createRuntimeRunEntity(
  input: RuntimeRunEntity,
): RuntimeRunEntity {
  return input;
}
