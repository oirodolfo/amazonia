import type { RuntimeBehaviorInsight } from '@/shared/runtime/runtime-intelligence-v2';
import { PremiumCard } from '@/renderer/ui/PremiumCard';

export interface LiveRuntimeBrainPanelProps {
  readonly insights: readonly RuntimeBehaviorInsight[];
}

/**
 * Renders the runtime intelligence brain panel.
 *
 * @param props - Runtime insights.
 * @returns Runtime intelligence panel.
 *
 * @example
 * ```tsx
 * <LiveRuntimeBrainPanel insights={insights} />
 * ```
 */
export function LiveRuntimeBrainPanel(
  props: LiveRuntimeBrainPanelProps,
): React.Element {
  return (
    <PremiumCard tone="warning" eyebrow="Runtime Brain" title="Behavior Intelligence">
      <div className="space-y-3">
        {props.insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-2xl border border-amber-400/10 bg-black/30 p-4"
          >
            <h3 className="text-sm font-semibold text-amber-200">
              {insight.title}
            </h3>

            <p className="mt-2 text-xs text-zinc-400">
              {insight.description}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-amber-300"
                style={{ width: `${Math.min(100, insight.metric)}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </PremiumCard>
  );
}
