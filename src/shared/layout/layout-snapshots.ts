export interface LayoutSnapshot {
    readonly id: string;
    readonly name: string;
    readonly panels: readonly number[];
    readonly createdAt: number;
}

export interface LayoutSnapshotState {
    readonly activeSnapshotId: string | null;
    readonly snapshots: readonly LayoutSnapshot[];
}

/**
 * Saves a layout snapshot while keeping the history bounded.
 *
 * @param state - Current layout snapshot state.
 * @param name - Snapshot name.
 * @param panels - Panel sizes.
 * @param maxSnapshots - Maximum snapshots to keep.
 * @returns Updated snapshot state.
 *
 * @example
 * ```ts
 * saveLayoutSnapshot(state, 'Focused terminal', [20, 60, 20])
 * ```
 */
export function saveLayoutSnapshot(state: LayoutSnapshotState, name: string, panels: readonly number[], maxSnapshots = 20): LayoutSnapshotState {
    const snapshot: LayoutSnapshot = {
        id: `layout_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        panels,
        createdAt: Date.now(),
    };

    return {activeSnapshotId: snapshot.id, snapshots: [snapshot, ...state.snapshots].slice(0, maxSnapshots)};
}

/**
 * Restores a layout snapshot by id.
 *
 * @param state - Layout snapshot state.
 * @param snapshotId - Snapshot id.
 * @returns Matching snapshot or null.
 *
 * @example
 * ```ts
 * restoreLayoutSnapshot(state, state.activeSnapshotId!)
 * ```
 */
export function restoreLayoutSnapshot(state: LayoutSnapshotState, snapshotId: string): LayoutSnapshot | null {
    return state.snapshots.find((snapshot) => snapshot.id === snapshotId) ?? null;
}
