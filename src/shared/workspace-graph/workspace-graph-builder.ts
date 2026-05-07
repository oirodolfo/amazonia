import type { WorkspaceActionGroup } from '@/shared/actions/action-types';
import type { WorkspaceGraph, WorkspaceGraphEdge, WorkspaceGraphNode } from './workspace-graph-types';

export interface BuildWorkspaceGraphOptions {
  readonly rootLabel: string;
  readonly groups: readonly WorkspaceActionGroup[];
}

/**
 * Builds a workspace graph from packages, actions and tools.
 *
 * @param options - Root label and action groups.
 * @returns Workspace graph.
 *
 * @example
 * ```ts
 * buildWorkspaceGraph({ rootLabel: 'amazonia', groups })
 * ```
 */
export function buildWorkspaceGraph(options: BuildWorkspaceGraphOptions): WorkspaceGraph {
  const nodes = new Map<string, WorkspaceGraphNode>();
  const edges = new Map<string, WorkspaceGraphEdge>();
  const rootId = 'workspace:root';
  nodes.set(rootId, { id: rootId, label: options.rootLabel, kind: 'root', weight: options.groups.length, metadata: {} });
  for (const group of options.groups) {
    nodes.set(group.packageId, { id: group.packageId, label: group.packageName, kind: 'package', weight: group.actions.length, metadata: { path: group.packagePath, tools: group.detectedTools } });
    addEdge(edges, rootId, group.packageId, 'contains', group.packagePath, group.actions.length);
    for (const tool of group.detectedTools) {
      const toolId = `tool:${tool}`;
      nodes.set(toolId, { id: toolId, label: tool, kind: 'tool', weight: 1, metadata: {} });
      addEdge(edges, group.packageId, toolId, 'uses-tool', tool, 1);
    }
    for (const action of group.actions) {
      nodes.set(action.id, { id: action.id, label: action.name, kind: 'action', weight: Math.max(1, action.frequency), metadata: { command: action.command, cwd: action.cwd, tool: action.tool, kind: action.kind } });
      addEdge(edges, group.packageId, action.id, 'runs', action.tool, Math.max(1, action.frequency));
    }
  }
  return { nodes: [...nodes.values()].sort((left, right) => sortNode(left) - sortNode(right) || left.label.localeCompare(right.label)), edges: [...edges.values()].sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to)) };
}

/**
 * Returns central package nodes ordered by weight.
 *
 * @param graph - Workspace graph.
 * @param limit - Maximum nodes.
 * @returns Central package nodes.
 *
 * @example
 * ```ts
 * getCentralWorkspacePackages(graph, 5)
 * ```
 */
export function getCentralWorkspacePackages(graph: WorkspaceGraph, limit = 8): WorkspaceGraphNode[] {
  return graph.nodes.filter((node) => node.kind === 'package').sort((left, right) => right.weight - left.weight).slice(0, limit);
}

function addEdge(edges: Map<string, WorkspaceGraphEdge>, from: string, to: string, kind: WorkspaceGraphEdge['kind'], label: string, weight: number): void {
  const id = `${from}->${to}:${kind}`;
  edges.set(id, { id, from, to, kind, label, weight });
}

function sortNode(node: WorkspaceGraphNode): number {
  switch (node.kind) {
    case 'root': return 0;
    case 'package': return 1;
    case 'tool': return 2;
    case 'action': return 3;
  }
}
