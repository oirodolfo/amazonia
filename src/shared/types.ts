export type RuntimeMode = 'electron' | 'web';
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';

export interface WorkspaceManifest {
    readonly rootPath: string;
    readonly name: string;
    readonly packageManager: PackageManager;
    readonly hasPnpmWorkspace: boolean;
    readonly hasTurbo: boolean;
    readonly hasNx: boolean;
    readonly packages: readonly WorkspacePackage[];
    readonly actions: readonly WorkspaceAction[];
    readonly scannedAtIso: string;
}

export interface WorkspacePackage {
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly relativePath: string;
    readonly scripts: Readonly<Record<string, string>>;
    readonly isRoot: boolean;
}

export type ActionKind = 'script' | 'turbo' | 'nx' | 'shell';

export interface WorkspaceAction {
    readonly id: string;
    readonly packageId: string;
    readonly packageName: string;
    readonly label: string;
    readonly command: string;
    readonly cwd: string;
    readonly kind: ActionKind;
    readonly weight: number;
    readonly description?: string;
}

export interface TerminalTab {
    readonly id: string;
    readonly title: string;
    readonly cwd: string;
    readonly command?: string;
    readonly createdAtIso: string;
    readonly status: 'idle' | 'running' | 'exited';
}

export interface RunRecord {
    readonly id: string;
    readonly actionId: string;
    readonly command: string;
    readonly cwd: string;
    readonly startedAtIso: string;
    readonly endedAtIso?: string;
    readonly durationMs?: number;
    readonly exitCode?: number;
    readonly status: 'running' | 'success' | 'failed' | 'cancelled';
}

export interface OutputDiagnostic {
    readonly level: 'info' | 'warning' | 'error' | 'success';
    readonly message: string;
    readonly filePath?: string;
    readonly url?: string;
    readonly line?: number;
    readonly column?: number;
}

export interface FriendlyOutputCard {
    readonly id: string;
    readonly runId: string;
    readonly command: string;
    readonly cwd: string;
    readonly status: RunRecord['status'];
    readonly durationMs?: number;
    readonly exitCode?: number;
    readonly diagnostics: readonly OutputDiagnostic[];
    readonly links: readonly string[];
}

export interface LayoutState {
    readonly sidebarSize: number;
    readonly terminalSize: number;
    readonly outputSize: number;
}

export interface TerminalSpawnRequest {
    readonly tabId: string;
    readonly cwd: string;
    readonly command?: string;
    readonly cols: number;
    readonly rows: number;
}

export interface TerminalInputMessage {
    readonly tabId: string;
    readonly data: string;
}

export interface TerminalResizeMessage {
    readonly tabId: string;
    readonly cols: number;
    readonly rows: number;
}

export type BridgeEvent =
    | { readonly type: 'terminal:data'; readonly tabId: string; readonly data: string }
    | { readonly type: 'terminal:exit'; readonly tabId: string; readonly exitCode: number }
    | { readonly type: 'workspace:changed'; readonly workspace: WorkspaceManifest };
