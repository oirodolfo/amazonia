import type { WorkspaceActionGroup } from '@/shared/actions/action-types';

export interface ActionGraphNode {
  readonly id: string;
  readonly label: string;
  readonly kind: 'package' | 'action';
}

export interface ActionGraphEdge {
  readonly from: string;
  readonly to: string;
  readonly label: string;
}

export interface ActionGraphModel {
  readonly nodes: readonly ActionGraphNode[];
  readonly edges: readonly ActionGraphEdge[];
}

/**
 * Builds a simple package-to-action graph from sidebar groups.
 *
 * @param groups - Workspace action groups.
 * @returns Graph model for visualization.
 *
 * @example
 * ```ts
 * buildActionGraph(groups)
 * ```
 */
export function buildActionGraph(groups: readonly WorkspaceActionGroup[]): ActionGraphModel {
  const nodes: ActionGraphNode[] = [];
  const edges: ActionGraphEdge[] = [];

  for (const group of groups) {
    nodes.push({ id: group.packageId, label: group.packageName, kind: 'package' });

    for (const action of group.actions) {
      nodes.push({ id: action.id, label: action.name, kind: 'action' });
      edges.push({ from: group.packageId, to: action.id, label: action.tool });
    }
  }

  return { nodes, edges };
}
