import type {WorkspaceGraph, WorkspaceGraphEdge, WorkspaceGraphNode} from './workspace-graph-types';

export type GraphStreamEvent =
    | { readonly type: 'node.upserted'; readonly node: WorkspaceGraphNode }
    | { readonly type: 'edge.upserted'; readonly edge: WorkspaceGraphEdge }
    | { readonly type: 'node.removed'; readonly nodeId: string }
    | { readonly type: 'graph.reset'; readonly graph: WorkspaceGraph };

export interface GraphStreamState {
    readonly graph: WorkspaceGraph;
    readonly eventCount: number;
}

/**
 * Applies a stream event to a workspace graph state.
 *
 * @param state - Current graph stream state.
 * @param event - Stream event.
 * @returns Updated graph stream state.
 *
 * @example
 * ```ts
 * reduceGraphStream(state, { type: 'node.removed', nodeId: 'pkg' })
 * ```
 */
export function reduceGraphStream(state: GraphStreamState, event: GraphStreamEvent): GraphStreamState {
    switch (event.type) {
        case 'graph.reset':
            return {graph: event.graph, eventCount: state.eventCount + 1};
        case 'node.upserted':
            return {
                graph: {...state.graph, nodes: upsertById(state.graph.nodes, event.node)},
                eventCount: state.eventCount + 1
            };
        case 'edge.upserted':
            return {
                graph: {...state.graph, edges: upsertById(state.graph.edges, event.edge)},
                eventCount: state.eventCount + 1
            };
        case 'node.removed':
            return {
                graph: {
                    nodes: state.graph.nodes.filter((node) => node.id !== event.nodeId),
                    edges: state.graph.edges.filter((edge) => edge.from !== event.nodeId && edge.to !== event.nodeId),
                },
                eventCount: state.eventCount + 1,
            };
    }
}

/**
 * Creates an empty graph stream state.
 *
 * @returns Empty graph stream state.
 *
 * @example
 * ```ts
 * createEmptyGraphStreamState()
 * ```
 */
export function createEmptyGraphStreamState(): GraphStreamState {
    return {graph: {nodes: [], edges: []}, eventCount: 0};
}

function upsertById<T extends { readonly id: string }>(items: readonly T[], next: T): T[] {
    return items.some((item) => item.id === next.id)
        ? items.map((item) => item.id === next.id ? next : item)
        : [...items, next];
}
