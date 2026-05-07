export type WorkspaceGraphNodeKind = 'root' | 'package' | 'action' | 'tool';
export type WorkspaceGraphEdgeKind = 'contains' | 'runs' | 'uses-tool' | 'related';

export interface WorkspaceGraphNode {
    readonly id: string;
    readonly label: string;
    readonly kind: WorkspaceGraphNodeKind;
    readonly weight: number;
    readonly metadata: Readonly<Record<string, unknown>>;
}

export interface WorkspaceGraphEdge {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly kind: WorkspaceGraphEdgeKind;
    readonly label: string;
    readonly weight: number;
}

export interface WorkspaceGraph {
    readonly nodes: readonly WorkspaceGraphNode[];
    readonly edges: readonly WorkspaceGraphEdge[];
}
