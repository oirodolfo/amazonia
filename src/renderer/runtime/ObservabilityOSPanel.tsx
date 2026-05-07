import type {WorkspaceHeatmapNode} from '@/shared/workspace-graph/workspace-heatmap';
import {PremiumCard} from '@/renderer/ui/PremiumCard';

export interface ObservabilityOSPanelProps {
    readonly heatmap: readonly WorkspaceHeatmapNode[];
}

/**
 * Renders the observability operating system panel.
 *
 * @param props - Heatmap nodes.
 * @returns Observability OS panel.
 *
 * @example
 * ```tsx
 * <ObservabilityOSPanel heatmap={nodes} />
 * ```
 */
export function ObservabilityOSPanel(
    props: ObservabilityOSPanelProps,
): React.Element {
    return (
        <PremiumCard tone="info" eyebrow="Observability OS" title="Workspace Heatmap">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {props.heatmap.map((node) => (
                    <article
                        key={node.id}
                        className="rounded-2xl border border-sky-400/10 bg-black/30 p-4"
                    >
                        <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-sky-100">
                {node.id}
              </span>

                            <span
                                className={
                                    node.color === 'hot'
                                        ? 'text-red-300'
                                        : node.color === 'warm'
                                            ? 'text-amber-300'
                                            : 'text-sky-300'
                                }
                            >
                ●
              </span>
                        </div>

                        <p className="mt-3 text-xs text-zinc-500">
                            Weight: {node.weight}
                        </p>
                    </article>
                ))}
            </div>
        </PremiumCard>
    );
}
