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
        label: 'dev',
        command: 'pnpm dev',
        cwd: '/repo',
        kind: 'script',
        weight: 0,
      }],
    }]);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
  });
});
