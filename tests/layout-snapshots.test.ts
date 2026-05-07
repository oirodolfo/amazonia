import { describe, expect, it } from 'vitest';
import { restoreLayoutSnapshot, saveLayoutSnapshot, type LayoutSnapshotState } from '../src/shared/layout/layout-snapshots';

describe('layout snapshots', () => {
  it('saves and restores layout snapshots', () => {
    const initial: LayoutSnapshotState = { activeSnapshotId: null, snapshots: [] };
    const saved = saveLayoutSnapshot(initial, 'Default', [24, 50, 26]);
    const restored = restoreLayoutSnapshot(saved, saved.activeSnapshotId!);

    expect(saved.snapshots).toHaveLength(1);
    expect(restored?.panels).toEqual([24, 50, 26]);
  });
});
