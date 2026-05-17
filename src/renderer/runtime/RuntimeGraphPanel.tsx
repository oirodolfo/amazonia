import type {RuntimeWorkspaceGraph} from '@/shared/runtime/runtime-intelligence-types';

export interface RuntimeGraphPanelProps {
    readonly graph: RuntimeWorkspaceGraph;
}

/**
 * Renders a lightweight runtime graph preview.
 *
 * // TODO(runtime-graph): replace temporary list visualization with a real force-directed graph.
 *
 * @param props - Runtime graph props.
 * @returns Runtime graph panel.
 *
 * @example
 * ```tsx
 * <RuntimeGraphPanel graph={graph} />
 * ```
 */
export function RuntimeGraphPanel(props: RuntimeGraphPanelProps): React.ReactElement {
    return (
        <section className="rounded-[1.5rem] border border-emerald-400/10 bg-[#141414] p-4">
            <h2 className="mb-4 text-xs uppercase tracking-[0.24em] text-emerald-300/70">
                Runtime Graph
            </h2>

            <div className="space-y-2">
                {props.graph.nodes.slice(0, 30).map((node) => (
                    <article
                        key={node.id}
                        className="rounded-2xl border border-white/5 bg-black/30 px-3 py-2"
                    >
                        <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-zinc-100">
                {node.label}
              </span>

                            <span
                                className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] uppercase text-emerald-300">
                {node.type}
              </span>
                        </div>

                        <p className="text-[10px] text-zinc-500">
                            weight {node.weight}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
