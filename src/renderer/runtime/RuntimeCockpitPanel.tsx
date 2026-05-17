import type {RuntimeStoreSnapshot} from '@/shared/runtime/workbench-runtime-store';
import {replayRuntimeSnapshot} from '@/shared/runtime/runtime-replay-engine';
import {PremiumCard} from '@/renderer/ui/PremiumCard';
import {NeonStatusPill} from '@/renderer/ui/NeonStatusPill';

export interface RuntimeCockpitPanelProps {
    readonly snapshot: RuntimeStoreSnapshot;
}

/**
 * Renders the runtime cockpit overview panel.
 *
 * @param props - Runtime snapshot.
 * @returns Runtime cockpit panel.
 *
 * @example
 * ```tsx
 * <RuntimeCockpitPanel snapshot={snapshot} />
 * ```
 */
export function RuntimeCockpitPanel(props: RuntimeCockpitPanelProps): React.ReactElement {
    const replay = replayRuntimeSnapshot(props.snapshot);

    return (
        <PremiumCard tone="forest" eyebrow="Runtime Cockpit" title="Unified Runtime Store">
            <div className="mb-4 flex flex-wrap gap-2">
                <NeonStatusPill tone="forest" label="events" value={props.snapshot.events.length}/>
                <NeonStatusPill tone="violet" label="frames" value={replay.totalFrames}/>
            </div>

            <div className="rounded-2xl border border-emerald-400/10 bg-black/30 p-4">
                <div className="space-y-2">
                    {replay.frames.slice(0, 20).map((frame) => (
                        <div
                            key={`${frame.index}:${frame.timestamp}`}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                        >
                            <span className="font-mono text-xs text-emerald-200">{frame.type}</span>
                            <span className="text-xs text-zinc-500">{frame.timestamp}</span>
                        </div>
                    ))}
                </div>
            </div>
        </PremiumCard>
    );
}
