import { useMemo, useState } from 'react';
import { createTerminalSections, toggleFoldedSection } from '@/shared/terminal/terminal-section-folding';
import { PremiumCard } from '@/renderer/ui/PremiumCard';

export interface FoldableTerminalSectionsProps {
  readonly lines: readonly string[];
}

/**
 * Renders terminal output as foldable semantic sections.
 *
 * @param props - Terminal output lines.
 * @returns Foldable terminal sections panel.
 *
 * @example
 * ```tsx
 * <FoldableTerminalSections lines={lines} />
 * ```
 */
export function FoldableTerminalSections(props: FoldableTerminalSectionsProps): React.Element {
  const sections = useMemo(() => createTerminalSections(props.lines), [props.lines]);
  const [foldedIds, setFoldedIds] = useState<string[]>(() => sections.filter((section) => section.defaultCollapsed).map((section) => section.id));

  return (
    <PremiumCard tone="terminal" eyebrow="Streaming" title="Terminal Sections">
      <div className="space-y-3">
        {sections.map((section) => {
          const isFolded = foldedIds.includes(section.id);

          return (
            <article key={section.id} className="overflow-hidden rounded-2xl border border-emerald-400/10 bg-black/35">
              <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setFoldedIds((current) => toggleFoldedSection(current, section.id))}>
                <span>
                  <span className="text-sm font-semibold text-emerald-50">{section.title}</span>
                  <span className="ml-3 text-xs text-zinc-500">{section.lines.length} lines</span>
                </span>
                <span className="rounded-full bg-zinc-700/40 px-2 py-1 text-xs text-zinc-300">{section.severity}</span>
              </button>

              {!isFolded ? <pre className="max-h-96 overflow-auto border-t border-emerald-400/10 px-4 py-3 text-xs text-zinc-300">{section.lines.join('\n')}</pre> : null}
            </article>
          );
        })}
      </div>
    </PremiumCard>
  );
}
