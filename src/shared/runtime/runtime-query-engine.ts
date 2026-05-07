export interface RuntimeQueryResult<T> {
  readonly items: readonly T[];
}

/**
 * Creates a lightweight runtime query result.
 *
 * @param items - Query items.
 * @returns Runtime query result.
 *
 * @example
 * ```ts
 * createRuntimeQueryResult([1, 2])
 * ```
 */
export function createRuntimeQueryResult<T>(
  items: readonly T[],
): RuntimeQueryResult<T> {
  return {
    items,
  };
}
