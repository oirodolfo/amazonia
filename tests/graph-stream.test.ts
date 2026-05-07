import { describe, expect, it } from 'vitest';
import { createEmptyGraphStreamState, reduceGraphStream } from '../src/shared/workspace-graph/graph-stream';

describe('graph stream', () => {
  it('upserts and removes nodes', () => {
    const state = createEmptyGraphStreamState();
    const withNode = reduceGraphStream(state, {
      type: 'node.upserted',
      node: { id: 'pkg', label: 'pkg', kind: 'package', weight: 1, metadata: {} },
    });

    expect(withNode.graph.nodes).toHaveLength(1);

    const removed = reduceGraphStream(withNode, { type: 'node.removed', nodeId: 'pkg' });

    expect(removed.graph.nodes).toHaveLength(0);
  });
});
