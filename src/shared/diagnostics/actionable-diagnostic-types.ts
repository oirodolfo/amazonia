export type DiagnosticSourceKind = 'node' | 'typescript' | 'npm' | 'pnpm' | 'shell' | 'unknown';

export type DiagnosticActionKind =
    | 'open-editor'
    | 'pin-command'
    | 'run-command'
    | 'copy-command'
    | 'copy-message';

export interface DiagnosticLocation {
    readonly file: string;
    readonly line: number | null;
    readonly column: number | null;
}

export interface DiagnosticSuggestedAction {
    readonly id: string;
    readonly kind: DiagnosticActionKind;
    readonly label: string;
    readonly command: string | null;
    readonly description: string;
}

export interface ActionableDiagnostic {
    readonly id: string;
    readonly source: DiagnosticSourceKind;
    readonly severity: 'error' | 'warning' | 'info';
    readonly title: string;
    readonly message: string;
    readonly raw: string;
    readonly location: DiagnosticLocation | null;
    readonly suggestedActions: readonly DiagnosticSuggestedAction[];
}

export interface PinnedDiagnosticCommand {
    readonly id: string;
    readonly diagnosticId: string;
    readonly command: string;
    readonly label: string;
    readonly createdAt: number;
}
