import * as React from 'react';
import type { FriendlyOutputCard } from '@/shared';
import { t } from '@/renderer/i18n/messages';

interface RunTimelineProps {
  readonly cards: readonly FriendlyOutputCard[];
}

/**
 * Renders a compact DevTools-inspired timeline for recent runs.
 *
 * @param props - Friendly output cards to visualize.
 * @returns A timeline section for the output panel.
 *
 * @example
 * ```tsx
 * <RunTimeline cards={cards} />
 * ```
 */
export function RunTimeline({ cards }: RunTimelineProps): React.ReactElement {
  return (
    <section className="rounded-2xl border border-emerald-300/10 bg-black/20 p-3 shadow-[0_0_35px_rgba(16,185,129,.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">{t('output.timeline')}</h2>
        <span className="text-[10px] text-zinc-500">{cards.length}</span>
      </div>
      <div className="space-y-2">
        {cards.slice(0, 8).map((card) => (
          <div key={card.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-2 text-xs">
            <span className="text-zinc-500">{card.durationMs ?? 0}ms</span>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full rounded-full bg-emerald-400/70" style={{ width: `${Math.min(100, Math.max(8, (card.durationMs ?? 80) / 30))}%` }} />
            </div>
            <span className={card.status === 'success' ? 'text-emerald-300' : card.status === 'failed' ? 'text-red-300' : 'text-zinc-400'}>{card.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
