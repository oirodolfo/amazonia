import { describe, expect, it } from 'vitest';
import { buildActionGraph } from '../src/workspace/action-graph';
import type { WorkspaceManifest } from '../src/shared/types';

describe('buildActionGraph', () => {
  it('creates nodes and pipeline edges', () => {
    const manifest: WorkspaceManifest = {
      rootPath: '/repo',
      name: 'repo',
      packageManager: 'pnpm',
      hasPnpmWorkspace: true,
      hasTurbo: false,
      hasNx: false,
      scannedAtIso: '2026-01-01T00:00:00.000Z',
      packages: [],
      actions: [
        { id: 'a:test', packageId: 'a', packageName: 'a', label: 'test', command: 'pnpm test', cwd: '/repo/a', kind: 'script', weight: 1 },
        { id: 'a:build', packageId: 'a', packageName: 'a', label: 'build', command: 'pnpm build', cwd: '/repo/a', kind: 'script', weight: 1 },
      ],
    };

    const graph = buildActionGraph(manifest);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([{ from: 'a:test', to: 'a:build', reason: 'pipeline-order' }]);
  });
});
