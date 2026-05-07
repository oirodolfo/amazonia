import * as React from 'react';
import type { FriendlyOutputCard } from '@/shared';
import { sortCardsByAttention, summarizeRunHealth } from '@/runs/run-diagnostics';

export interface RunInspectorPanelProps {
  readonly cards: readonly FriendlyOutputCard[];
}

/**
 * Shows a compact attention queue for recent runs.
 *
 * @param props - Recent friendly output cards to inspect.
 * @returns A React panel focused on errors, warnings and health score.
 *
 * @example
 * ```tsx
 * <RunInspectorPanel cards={cards} />
 * ```
 */
export function RunInspectorPanel(props: RunInspectorPanelProps): React.ReactElement {
  const sortedCards = React.useMemo(() => sortCardsByAttention(props.cards).slice(0, 5), [props.cards]);

  return (
    <section className="rounded-2xl border border-emerald-400/15 bg-black/25 p-3 shadow-[0_0_30px_rgba(16,185,129,.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Run Inspector</h2>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400">v9</span>
      </div>
      <div className="space-y-2">
        {sortedCards.length === 0 ? <p className="text-xs text-zinc-500">No runs yet. Start an action and the forest will light up.</p> : null}
        {sortedCards.map((card) => {
          const health = summarizeRunHealth(card);
          return (
            <article key={card.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-3">
                <strong className="truncate text-xs text-zinc-100">{card.command}</strong>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-100">{health.score}</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">{health.headline}</p>
              <div className="mt-2 flex gap-2 text-[10px] text-zinc-500">
                <span>{health.errorCount} errors</span>
                <span>{health.warningCount} warnings</span>
                <span>{health.linkCount} links</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
