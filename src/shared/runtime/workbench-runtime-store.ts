export interface RuntimeStoreEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface RuntimeStoreSnapshot {
  readonly events: readonly RuntimeStoreEvent[];
  readonly createdAt: number;
}

export interface WorkbenchRuntimeStore {
  readonly events: readonly RuntimeStoreEvent[];
  publish(event: RuntimeStoreEvent): void;
  snapshot(): RuntimeStoreSnapshot;
  clear(): void;
}

/**
 * Creates the unified runtime store powering timeline, graph and diagnostics.
 *
 * @returns Runtime store instance.
 *
 * @example
 * ```ts
 * const store = createWorkbenchRuntimeStore()
 * ```
 */
export function createWorkbenchRuntimeStore(): WorkbenchRuntimeStore {
  const events: RuntimeStoreEvent[] = [];

  return {
    get events() {
      return events;
    },

    publish(event) {
      events.push(event);
    },

    snapshot() {
      return {
        events: [...events],
        createdAt: Date.now(),
      };
    },

    clear() {
      events.length = 0;
    },
  };
}
