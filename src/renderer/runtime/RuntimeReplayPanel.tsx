import type { RuntimeReplaySession } from '@/shared/runtime/runtime-replay-session';
import { PremiumCard } from '@/renderer/ui/PremiumCard';

export interface RuntimeReplayPanelProps {
  readonly session: RuntimeReplaySession;
}

/**
 * Renders replay session frames.
 *
 * @param props - Replay session.
 * @returns Replay panel.
 *
 * @example
 * ```tsx
 * <RuntimeReplayPanel session={session} />
 * ```
 */
export function RuntimeReplayPanel(
  props: RuntimeReplayPanelProps,
): React.Element {
  return (
    <PremiumCard tone="violet" eyebrow="Replay Mode" title="Runtime Replay">
      <div className="space-y-2">
        {props.session.frames.slice(0, 30).map((frame) => (
          <div
            key={`${frame.index}:${frame.timestamp}`}
            className="flex items-center justify-between rounded-xl border border-violet-400/10 bg-black/30 px-3 py-2"
          >
            <span className="font-mono text-xs text-violet-200">{frame.type}</span>
            <span className="text-xs text-zinc-500">{frame.timestamp}</span>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
