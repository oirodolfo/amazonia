import type {TimelineSnapshot} from '@/timeline';

export interface DevtoolsTimelinePanelProps {
    readonly snapshot: TimelineSnapshot;
}

/**
 * Renders a compact DevTools-inspired timeline from normalized lane data.
 *
 * @param props - Timeline panel properties.
 * @returns A React element with lane bars and event metadata.
 *
 * @example
 * ```tsx
 * <DevtoolsTimelinePanel snapshot={snapshot} />
 * ```
 */
export function DevtoolsTimelinePanel({snapshot}: DevtoolsTimelinePanelProps): React.Element {
    return (
        <section
            className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
            <header className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/70">DevTools Timeline</p>
                    <h2 className="text-lg font-semibold text-emerald-50">Run flame lanes</h2>
                </div>
                <span
                    className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs text-emerald-100">{snapshot.totalDurationMs}ms</span>
            </header>

            <div className="space-y-3">
                {snapshot.lanes.map((lane) => (
                    <div key={lane.kind} className="grid grid-cols-[7rem_1fr] items-center gap-3">
                        <span className="text-xs uppercase tracking-wider text-zinc-400">{lane.kind}</span>
                        <div className="flex min-h-8 items-center gap-1 rounded-xl bg-zinc-950/80 p-1">
                            {lane.events.map((event) => (
                                <div
                                    key={event.id}
                                    className="min-w-16 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-50"
                                    title={`${event.label} · ${event.durationMs}ms`}
                                    style={{width: `${Math.max(12, percent(event.durationMs, Math.max(1, lane.totalDurationMs)))}%`}}
                                >
                                    {event.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function percent(value: number, total: number): number {
    return Math.min(100, Math.round((value / total) * 100));
}
