import type {WorkspaceGraph} from '@/shared/workspace-graph/workspace-graph-types';
import {PremiumCard} from '@/renderer/ui/PremiumCard';
import {NeonStatusPill} from '@/renderer/ui/NeonStatusPill';

export interface LiveWorkspaceGraphStreamPanelProps {
    readonly graph: WorkspaceGraph;
    readonly eventCount: number;
    readonly onSelectNode?: (nodeId: string) => void;
}

/**
 * Renders the live workspace graph stream view.
 *
 * @param props - Graph state and stream metadata.
 * @returns Live graph stream panel.
 *
 * @example
 * ```tsx
 * <LiveWorkspaceGraphStreamPanel graph={graph} eventCount={3} />
 * ```
 */
export function LiveWorkspaceGraphStreamPanel(props: LiveWorkspaceGraphStreamPanelProps): React.Element {
    return (
        <PremiumCard tone="violet" eyebrow="Live Graph" title="Workspace Stream">
            <div className="mb-4 flex flex-wrap gap-2">
                <NeonStatusPill tone="violet" label="nodes" value={props.graph.nodes.length}/>
                <NeonStatusPill tone="info" label="edges" value={props.graph.edges.length}/>
                <NeonStatusPill tone="forest" label="events" value={props.eventCount}/>
            </div>

            <div className="relative min-h-80 overflow-hidden rounded-3xl border border-violet-400/10 bg-black/35 p-4">
                <div className="relative grid grid-cols-2 gap-3 md:grid-cols-3">
                    {props.graph.nodes.slice(0, 30).map((node) => (
                        <button key={node.id} type="button"
                                className="rounded-2xl border border-violet-400/10 bg-zinc-950/80 px-3 py-3 text-left transition hover:border-violet-300/30 hover:bg-violet-400/10"
                                onClick={() => props.onSelectNode?.(node.id)}>
                            <span className="block truncate text-sm font-semibold text-violet-50">{node.label}</span>
                            <span className="mt-1 block text-xs text-zinc-500">{node.kind} · {node.weight}</span>
                        </button>
                    ))}
                </div>
            </div>
        </PremiumCard>
    );
}
