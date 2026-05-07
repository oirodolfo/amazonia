import { describe, expect, it } from 'vitest';
import { buildActionGraph } from '../src/shared/action-graph/action-graph-model';

describe('buildActionGraph', () => {
  it('creates package and action nodes', () => {
    const graph = buildActionGraph([{
      packageId: 'pkg',
      packageName: '@pkg/demo',
      packagePath: '.',
      detectedTools: ['package-json'],
      actions: [{
        id: 'action',
        packageId: 'pkg',
        packageName: '@pkg/demo',
        packagePath: '.',
        name: 'dev',
        command: 'pnpm dev',
        cwd: '/repo',
        kind: 'script',
        tool: 'package-json',
        frequency: 0,
        isFavorite: false,
        searchText: 'dev',
      }],
    }]);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
  });
});
