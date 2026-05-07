import {buildVisualTimelineModel, type TimelineSeverity} from '@/shared/timeline/visual-timeline-model';
import type {RunTimelineEvent} from '@/shared/timeline/run-timeline';
import {PremiumCard} from '@/renderer/ui/PremiumCard';
import {NeonStatusPill} from '@/renderer/ui/NeonStatusPill';

export interface RealTimelinePanelProps {
    readonly events: readonly RunTimelineEvent[];
    readonly onSelectRun?: (runId: string) => void;
}

/**
 * Renders a DevTools-style visual timeline with scaled run lanes.
 *
 * @param props - Timeline events and optional selection callback.
 * @returns Timeline panel element.
 *
 * @example
 * ```tsx
 * <RealTimelinePanel events={timelineEvents} />
 * ```
 */
export function RealTimelinePanel(props: RealTimelinePanelProps): React.Element {
    const model = buildVisualTimelineModel(props.events);
    return (
        <PremiumCard tone="terminal" eyebrow="DevTools Mode" title="Real Timeline" className="min-h-96">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <NeonStatusPill tone="info" label="runs" value={model.lanes.length}/>
                <NeonStatusPill tone="forest" label="duration" value={`${model.durationMs}ms`}/>
                <NeonStatusPill tone="warning" label="events" value={props.events.length}/>
            </div>
            <div className="rounded-2xl border border-emerald-400/10 bg-black/40 p-4">
                <div
                    className="mb-3 grid grid-cols-[180px_1fr_72px] gap-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    <span>run</span><span>timeline</span><span>duration</span></div>
                <div className="space-y-3">
                    {model.lanes.map((lane) => (
                        <button key={lane.runId} type="button"
                                className="grid w-full grid-cols-[180px_1fr_72px] items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-emerald-400/10 hover:bg-emerald-400/5"
                                onClick={() => props.onSelectRun?.(lane.runId)}>
                            <span className="truncate text-xs text-zinc-300">{lane.label}</span>
                            <span className="relative h-7 rounded-full bg-zinc-950"><span
                                className={resolveLaneClassName(lane.severity)} style={{
                                left: `${lane.leftPercent}%`,
                                width: `${lane.widthPercent}%`
                            }}/>{lane.events.map((event) => (<span key={event.id}
                                                                   className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-zinc-100 shadow-[0_0_10px_currentColor]"
                                                                   style={{left: `${Math.min(99, Math.max(0, ((event.timestamp - model.startedAt) / Math.max(1, model.durationMs)) * 100))}%`}}
                                                                   title={event.label}/>))}</span>
                            <span className="font-mono text-xs text-emerald-300">{lane.durationMs}ms</span>
                        </button>
                    ))}
                </div>
            </div>
        </PremiumCard>
    );
}

function resolveLaneClassName(severity: TimelineSeverity): string {
    const base = 'absolute top-1/2 h-3 -translate-y-1/2 rounded-full shadow-[0_0_20px_currentColor] transition-all';
    switch (severity) {
        case 'error':
            return `${base} bg-red-400 text-red-400`;
        case 'warning':
            return `${base} bg-amber-300 text-amber-300`;
        case 'success':
            return `${base} bg-emerald-300 text-emerald-300`;
        case 'info':
            return `${base} bg-sky-300 text-sky-300`;
    }
}
