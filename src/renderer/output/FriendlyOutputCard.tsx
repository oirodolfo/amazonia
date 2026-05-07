import type { FriendlyOutputCard as FriendlyOutputCardModel } from '@/renderer/workbench/workbench-state';

export interface FriendlyOutputCardProps {
  readonly card: FriendlyOutputCardModel;
}

/**
 * Renders a friendly card from parsed terminal output.
 *
 * @param props - Output card model.
 * @returns Friendly output card.
 *
 * @example
 * ```tsx
 * <FriendlyOutputCard card={card} />
 * ```
 */
export function FriendlyOutputCard(props: FriendlyOutputCardProps): JSX.Element {
  const { card } = props;

  return (
    <article className="rounded-2xl border border-emerald-400/10 bg-zinc-900/70 p-4 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-50">{card.title}</h3>
          <p className="text-xs text-zinc-500">{new Date(card.createdAt).toLocaleTimeString()}</p>
        </div>
        <span className="rounded-full border border-emerald-400/20 px-2 py-1 text-xs text-emerald-300">
          {card.summary.errors}E / {card.summary.warnings}W
        </span>
      </header>

      <div className="mt-4 space-y-2">
        {card.summary.issues.map((issue, index) => (
          <div key={`${issue.message}-${index}`} className="rounded-xl border border-zinc-700/70 bg-zinc-950/70 p-3 text-xs">
            <div className={issue.severity === 'error' ? 'text-red-300' : 'text-amber-300'}>{issue.severity.toUpperCase()}</div>
            <p className="mt-1 text-zinc-300">{issue.message}</p>
            {issue.file ? <p className="mt-2 font-mono text-emerald-300">{issue.file}:{issue.line ?? 1}:{issue.column ?? 1}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.summary.links.slice(0, 8).map((link, index) => (
          <span key={`${link.value}-${index}`} className="rounded-lg border border-emerald-400/10 bg-emerald-400/5 px-2 py-1 font-mono text-[11px] text-emerald-200">
            {link.value}{link.line ? `:${link.line}` : ''}
          </span>
        ))}
      </div>
    </article>
  );
}
