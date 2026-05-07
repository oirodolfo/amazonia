export interface WorkspaceDependencyNode {
    readonly id: string;
    readonly dependencies: readonly string[];
}

export interface WorkspaceDependencyGraph {
    readonly nodes: readonly WorkspaceDependencyNode[];
}

/**
 * Builds a normalized dependency graph from workspace package manifests.
 *
 * @param manifests - Workspace package manifests.
 * @returns Workspace dependency graph.
 *
 * @example
 * ```ts
 * createWorkspaceDependencyGraph(manifests)
 * ```
 */
export function createWorkspaceDependencyGraph(
    manifests: readonly {
        name: string;
        dependencies?: Readonly<Record<string, string>>;
    }[],
): WorkspaceDependencyGraph {
    return {
        nodes: manifests.map((manifest) => ({
            id: manifest.name,
            dependencies: Object.keys(manifest.dependencies ?? {}),
        })),
    };
}
