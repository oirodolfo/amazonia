export interface RuntimeEventBusEvent<TPayload = unknown> {
    readonly id: string;
    readonly type: string;
    readonly createdAt: number;
    readonly payload: TPayload;
}

export type RuntimeEventBusListener<TPayload = unknown> = (
    event: RuntimeEventBusEvent<TPayload>,
) => void;

export interface RuntimeEventBus {
    publish<TPayload>(event: RuntimeEventBusEvent<TPayload>): void;

    subscribe<TPayload>(
        type: string,
        listener: RuntimeEventBusListener<TPayload>,
    ): () => void;
}

/**
 * Creates the central runtime event bus used across timeline, terminal,
 * graph and diagnostics.
 *
 * @returns Runtime event bus.
 *
 * @example
 * ```ts
 * const bus = createRuntimeEventBus()
 * ```
 */
export function createRuntimeEventBus(): RuntimeEventBus {
    const listeners = new Map<string, Set<RuntimeEventBusListener>>();

    return {
        publish(event) {
            const bucket = listeners.get(event.type);

            if (!bucket) {
                return;
            }

            for (const listener of bucket) {
                listener(event);
            }
        },

        subscribe(type, listener) {
            const bucket = listeners.get(type) ?? new Set();
            bucket.add(listener as RuntimeEventBusListener);
            listeners.set(type, bucket);

            return () => {
                bucket.delete(listener as RuntimeEventBusListener);

                if (bucket.size === 0) {
                    listeners.delete(type);
                }
            };
        },
    };
}
