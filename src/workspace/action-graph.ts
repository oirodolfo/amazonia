import type {WorkspaceAction, WorkspaceManifest} from '@/shared/types';

export interface ActionGraphNode {
    readonly id: string;
    readonly label: string;
    readonly packageName: string;
    readonly kind: WorkspaceAction['kind'];
    readonly command: string;
    readonly cwd: string;
    readonly weight: number;
}

export interface ActionGraphEdge {
    readonly from: string;
    readonly to: string;
    readonly reason: 'same-package' | 'pipeline-order';
}

export interface ActionGraph {
    readonly nodes: readonly ActionGraphNode[];
    readonly edges: readonly ActionGraphEdge[];
}

const PIPELINE_ORDER = ['lint', 'typecheck', 'test', 'build', 'dev'] as const;

/**
 * Builds a lightweight action graph used by command palette, hover cards and future timeline views.
 *
 * @param manifest - Scanned workspace manifest.
 * @returns A deterministic graph connecting related package actions.
 *
 * @example
 * ```ts
 * const graph = buildActionGraph(manifest);
 * graph.nodes.length === manifest.actions.length;
 * ```
 */
export function buildActionGraph(manifest: WorkspaceManifest): ActionGraph {
    const nodes = manifest.actions.map((action) => ({
        id: action.id,
        label: action.label,
        packageName: action.packageName,
        kind: action.kind,
        command: action.command,
        cwd: action.cwd,
        weight: action.weight,
    } satisfies ActionGraphNode));

    const edges: ActionGraphEdge[] = [];
    const byPackage = groupActionsByPackage(manifest.actions);

    for (const packageActions of Object.values(byPackage)) {
        const sorted = [...packageActions].sort((left, right) => scorePipeline(left.label) - scorePipeline(right.label));
        for (let index = 0; index < sorted.length - 1; index += 1) {
            const from = sorted[index];
            const to = sorted[index + 1];
            if (from === undefined || to === undefined) continue;
            edges.push({from: from.id, to: to.id, reason: 'pipeline-order'});
        }
    }

    return {nodes, edges};
}

/**
 * Groups actions by package while keeping stable action ordering.
 *
 * @param actions - Workspace actions from the scanner.
 * @returns A package-name keyed action map.
 *
 * @example
 * ```ts
 * groupActionsByPackage(actions)['@scope/app']?.length;
 * ```
 */
export function groupActionsByPackage(actions: readonly WorkspaceAction[]): Readonly<Record<string, readonly WorkspaceAction[]>> {
    const grouped: Record<string, WorkspaceAction[]> = {};
    for (const action of actions) {
        grouped[action.packageName] ??= [];
        grouped[action.packageName].push(action);
    }
    return grouped;
}

function scorePipeline(label: string): number {
    const normalized = label.replace(/^turbo\s+|^nx\s+/u, '');
    const index = PIPELINE_ORDER.findIndex((step) => step === normalized);
    return index === -1 ? PIPELINE_ORDER.length + normalized.localeCompare('') : index;
}
