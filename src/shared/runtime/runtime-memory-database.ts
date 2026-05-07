import type {RuntimeStoreSnapshot} from './workbench-runtime-store';

export interface RuntimeMemoryRecord {
    readonly id: string;
    readonly snapshot: RuntimeStoreSnapshot;
    readonly createdAt: number;
}

export interface RuntimeMemoryDatabase {
    save(record: RuntimeMemoryRecord): void;

    list(): readonly RuntimeMemoryRecord[];

    get(id: string): RuntimeMemoryRecord | null;
}

/**
 * Creates an in-memory runtime database adapter.
 *
 * @returns Runtime memory database.
 *
 * @example
 * ```ts
 * const db = createRuntimeMemoryDatabase()
 * ```
 */
export function createRuntimeMemoryDatabase(): RuntimeMemoryDatabase {
    const records: RuntimeMemoryRecord[] = [];

    return {
        save(record) {
            records.push(record);
        },

        list() {
            return records;
        },

        get(id) {
            return records.find((record) => record.id === id) ?? null;
        },
    };
}
