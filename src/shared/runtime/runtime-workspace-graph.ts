import type {
  RuntimeCommandLifecycle,
  RuntimeWorkspaceGraph,
} from './runtime-intelligence-types';

/**
 * Builds a lightweight runtime graph from command lifecycles.
 *
 * @param lifecycles - Runtime lifecycles.
 * @returns Runtime graph.
 *
 * @example
 * ```ts
 * createRuntimeWorkspaceGraph(lifecycles)
 * ```
 */
export function createRuntimeWorkspaceGraph(
  lifecycles: readonly RuntimeCommandLifecycle[],
): RuntimeWorkspaceGraph {
  const nodes = [];
  const edges = [];

  for (const lifecycle of lifecycles) {
    nodes.push({
      id: lifecycle.id,
      type: 'command',
      label: lifecycle.command,
      weight: lifecycle.diagnostics.length + 1,
    });

    for (const diagnostic of lifecycle.diagnostics) {
      const diagnosticId = `${lifecycle.id}:${diagnostic.id}`;

      nodes.push({
        id: diagnosticId,
        type: 'diagnostic',
        label: diagnostic.message,
        weight: diagnostic.severity === 'error' ? 10 : 4,
      });

      edges.push({
        id: `edge:${lifecycle.id}:${diagnosticId}`,
        from: lifecycle.id,
        to: diagnosticId,
        label: diagnostic.severity,
      });
    }
  }

  return {
    nodes,
    edges,
  };
}
