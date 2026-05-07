import type { RunTimelineEvent } from '@/shared/timeline/run-timeline';
import { groupTimelineByRun } from '@/shared/timeline/run-timeline';

export interface RunTimelinePanelProps {
  readonly events: readonly RunTimelineEvent[];
}

/**
 * Renders a DevTools-like timeline grouped by run.
 *
 * @param props - Timeline events.
 * @returns Timeline panel.
 *
 * @example
 * ```tsx
 * <RunTimelinePanel events={events} />
 * ```
 */
export function RunTimelinePanel(props: RunTimelinePanelProps): JSX.Element {
  const groups = groupTimelineByRun(props.events);

  return (
    <section className="rounded-3xl border border-emerald-400/10 bg-zinc-950 p-4">
      <h2 className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">Timeline</h2>
      <div className="mt-4 space-y-4">
        {Object.entries(groups).map(([runId, events]) => (
          <article key={runId} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
            <h3 className="font-mono text-xs text-zinc-500">{runId}</h3>
            <div className="mt-3 space-y-2">
              {events.map((event) => (
                <div key={event.id} className="grid grid-cols-[120px_1fr_auto] gap-3 text-xs">
                  <span className="text-zinc-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  <span className="text-zinc-200">{event.label}</span>
                  <span className="text-emerald-300">{event.durationMs ? `${event.durationMs}ms` : '•'}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
