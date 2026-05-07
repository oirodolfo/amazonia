import type { SemanticTerminalSnapshot } from '@/shared/terminal/semantic-terminal-os';

export interface SemanticTerminalSidebarProps {
  readonly snapshot: SemanticTerminalSnapshot;
}

/**
 * Renders semantic markers detected from terminal streams.
 *
 * @param props - Semantic snapshot.
 * @returns Semantic sidebar.
 */
export function SemanticTerminalSidebar(
  props: SemanticTerminalSidebarProps,
): React.Element {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-emerald-400/10 bg-black/30">
      <header className="border-b border-emerald-400/10 px-4 py-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          Semantic Stream
        </h2>
      </header>

      <div className="flex-1 overflow-auto p-3">
        <div className="space-y-2">
          {props.snapshot.markers.map((marker) => (
            <article
              key={marker.id}
              className="rounded-xl border border-emerald-400/10 bg-zinc-950/70 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] uppercase text-emerald-300">
                  {marker.type}
                </span>

                <span className="text-[10px] text-zinc-500">
                  line {marker.line}
                </span>
              </div>

              <pre className="overflow-auto whitespace-pre-wrap text-[11px] text-zinc-300">
                {marker.value}
              </pre>
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
}
