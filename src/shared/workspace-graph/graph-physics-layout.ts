export interface GraphPhysicsNode {
    readonly id: string;
    readonly x: number;
    readonly y: number;
    readonly weight: number;
}

export interface GraphPhysicsLayout {
    readonly nodes: readonly GraphPhysicsNode[];
    readonly zoom: number;
    readonly panX: number;
    readonly panY: number;
}

/**
 * Creates a lightweight graph physics layout snapshot.
 *
 * @param nodes - Graph nodes.
 * @returns Graph physics layout.
 *
 * @example
 * ```ts
 * createGraphPhysicsLayout(nodes)
 * ```
 */
export function createGraphPhysicsLayout(
    nodes: readonly GraphPhysicsNode[],
): GraphPhysicsLayout {
    return {
        nodes,
        zoom: 1,
        panX: 0,
        panY: 0,
    };
}
