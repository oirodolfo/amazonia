export interface WorkspaceHeatmapNode {
    readonly id: string;
    readonly weight: number;
    readonly color: 'cold' | 'warm' | 'hot';
}

/**
 * Creates workspace heatmap nodes from weights.
 *
 * @param weights - Node weights.
 * @returns Heatmap nodes.
 *
 * @example
 * ```ts
 * createWorkspaceHeatmap([{ id: 'web', weight: 10 }])
 * ```
 */
export function createWorkspaceHeatmap(
    weights: readonly { id: string; weight: number }[],
): WorkspaceHeatmapNode[] {
    return weights.map((node) => ({
        id: node.id,
        weight: node.weight,
        color:
            node.weight > 80
                ? 'hot'
                : node.weight > 40
                    ? 'warm'
                    : 'cold',
    }));
}
