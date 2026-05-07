import type { TerminalReplayTimeline } from '@/shared/terminal/terminal-replay-timeline';

export interface SemanticReplayStripProps {
  readonly timeline: TerminalReplayTimeline;
  readonly onSelectFrame?: (index: number) => void;
}

/**
 * Renders a compact semantic replay strip for terminal output.
 *
 * @param props - Replay timeline.
 * @returns Semantic replay strip.
 *
 * @example
 * ```tsx
 * <SemanticReplayStrip timeline={timeline} />
 * ```
 */
export function SemanticReplayStrip(props: SemanticReplayStripProps): JSX.Element {
  return (
    <div className="rounded-[1.5rem] border border-emerald-400/10 bg-black/30 p-3">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="uppercase tracking-[0.2em] text-emerald-300/70">Replay Strip</span>
        <span className="text-zinc-500">{props.timeline.totalMarkers} markers</span>
      </div>

      <div className="flex h-10 items-end gap-1 overflow-hidden">
        {props.timeline.frames.slice(0, 120).map((frame) => (
          <button
            key={frame.index}
            type="button"
            className={frame.markerCount > 0 ? 'h-8 w-1 rounded bg-red-300' : 'h-3 w-1 rounded bg-emerald-400/30'}
            title={frame.line}
            onClick={() => props.onSelectFrame?.(frame.index)}
          />
        ))}
      </div>
    </div>
  );
}
