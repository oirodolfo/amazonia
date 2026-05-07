import type { TerminalAddonLoadResult } from '@/shared/terminal/addons/terminal-addon-types';

export interface TerminalAddonStatusPanelProps {
  readonly results: readonly TerminalAddonLoadResult[];
}

/**
 * Renders addon loading status for terminal debugging.
 *
 * @param props - Addon load results.
 * @returns Addon status panel.
 *
 * @example
 * ```tsx
 * <TerminalAddonStatusPanel results={results} />
 * ```
 */
export function TerminalAddonStatusPanel(
  props: TerminalAddonStatusPanelProps,
): React.Element {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-[#141414] p-4">
      <h2 className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500">
        Terminal Addons
      </h2>

      <div className="space-y-2">
        {props.results.map((result) => (
          <article
            key={result.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/30 px-3 py-2"
          >
            <span className="text-xs font-semibold text-zinc-200">
              {result.id}
            </span>

            <span
              className={
                result.status === 'loaded'
                  ? 'rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300'
                  : result.status === 'failed'
                    ? 'rounded-full bg-red-400/10 px-2 py-1 text-[10px] text-red-300'
                    : 'rounded-full bg-zinc-700/40 px-2 py-1 text-[10px] text-zinc-400'
              }
              title={result.reason ?? undefined}
            >
              {result.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
