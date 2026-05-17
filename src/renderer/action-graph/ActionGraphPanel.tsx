import type {WorkspaceActionGroup} from '@/shared/action-types';
import {buildActionGraph} from '@/shared/action-graph/action-graph-model';

export interface ActionGraphPanelProps {
    readonly groups: readonly WorkspaceActionGroup[];
    readonly onRunAction: (actionId: string) => void;
}

/**
 * Renders a lightweight visual action graph.
 *
 * @param props - Action groups and run callback.
 * @returns Action graph panel.
 *
 * @example
 * ```tsx
 * <ActionGraphPanel groups={groups} onRunAction={runAction} />
 * ```
 */
export function ActionGraphPanel(props: ActionGraphPanelProps): React.ReactElement {
    const graph = buildActionGraph(props.groups);
    const actionNodes = graph.nodes.filter((node) => node.kind === 'action');

    return (
        <section className="rounded-3xl border border-emerald-400/10 bg-zinc-950 p-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">Action Graph</h2>
            <p className="mt-2 text-sm text-zinc-500">{graph.nodes.length} nodes · {graph.edges.length} edges</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {actionNodes.slice(0, 24).map((node) => (
                    <button key={node.id} type="button"
                            className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2 text-left text-xs text-emerald-50 hover:bg-emerald-400/10"
                            onClick={() => props.onRunAction(node.id)}>
                        {node.label}
                    </button>
                ))}
            </div>
        </section>
    );
}
