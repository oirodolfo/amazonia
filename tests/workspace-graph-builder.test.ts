import { describe, expect, it } from 'vitest';
import { buildWorkspaceGraph, getCentralWorkspacePackages } from '../src/shared/workspace-graph/workspace-graph-builder';

describe('workspace graph builder', () => {
  it('builds root, package, tool and action nodes', () => {
    const graph = buildWorkspaceGraph({
      rootLabel: 'amazonia',
      groups: [{
        packageId: 'pkg',
        packageName: '@pkg/demo',
        packagePath: 'packages/demo',
        detectedTools: ['package-json', 'turbo'],
        actions: [{
          id: 'action',
          packageId: 'pkg',
          packageName: '@pkg/demo',
          label: 'dev',
          command: 'pnpm dev',
          cwd: '/repo/packages/demo',
          kind: 'script',
          weight: 3,
        }],
      }],
    });
    expect(graph.nodes.some((node) => node.kind === 'root')).toBe(true);
    expect(graph.nodes.some((node) => node.kind === 'tool')).toBe(true);
    expect(graph.nodes.some((node) => node.kind === 'action')).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('returns central packages by weight', () => {
    const graph = buildWorkspaceGraph({
      rootLabel: 'amazonia',
      groups: [
        { packageId: 'a', packageName: 'a', packagePath: 'a', detectedTools: ['package-json'], actions: [] },
        {
          packageId: 'b',
          packageName: 'b',
          packagePath: 'b',
          detectedTools: ['package-json'],
          actions: [{
            id: 'b:dev',
            packageId: 'b',
            packageName: 'b',
            label: 'dev',
            command: 'pnpm dev',
            cwd: '/repo/b',
            kind: 'script',
            weight: 1,
          }],
        },
      ],
    });
    expect(getCentralWorkspacePackages(graph)[0]?.id).toBe('b');
  });
});
