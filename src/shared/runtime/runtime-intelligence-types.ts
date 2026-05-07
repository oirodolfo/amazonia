export interface RuntimeDiagnosticMarker {
    readonly id: string;
    readonly line: number;
    readonly severity: 'error' | 'warning' | 'info';
    readonly message: string;
}

export interface RuntimeCommandLifecycle {
    readonly id: string;
    readonly command: string;
    readonly cwd: string;
    readonly startedAt: number;
    readonly finishedAt: number | null;
    readonly exitCode: number | null;
    readonly durationMs: number | null;
    readonly stdoutLines: readonly string[];
    readonly stderrLines: readonly string[];
    readonly diagnostics: readonly RuntimeDiagnosticMarker[];
}

export interface RuntimeWorkspaceGraphNode {
    readonly id: string;
    readonly type: 'workspace' | 'package' | 'command' | 'diagnostic';
    readonly label: string;
    readonly weight: number;
}

export interface RuntimeWorkspaceGraphEdge {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly label: string;
}

export interface RuntimeWorkspaceGraph {
    readonly nodes: readonly RuntimeWorkspaceGraphNode[];
    readonly edges: readonly RuntimeWorkspaceGraphEdge[];
}
