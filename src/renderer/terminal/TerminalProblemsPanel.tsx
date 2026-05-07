import type { TerminalProblem } from '@/shared/terminal/terminal-problems-engine';

export interface TerminalProblemsPanelProps {
  readonly problems: readonly TerminalProblem[];
  readonly onSelectProblem?: (problem: TerminalProblem) => void;
}

/**
 * Renders terminal diagnostics as a Problems panel.
 *
 * @param props - Terminal problems.
 * @returns Problems panel.
 *
 * @example
 * ```tsx
 * <TerminalProblemsPanel problems={problems} />
 * ```
 */
export function TerminalProblemsPanel(props: TerminalProblemsPanelProps): React.Element {
  return (
    <section className="rounded-[1.5rem] border border-red-400/10 bg-black/30">
      <header className="border-b border-red-400/10 px-4 py-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-red-300/70">Problems</h2>
      </header>

      <div className="max-h-96 overflow-auto p-3">
        <div className="space-y-2">
          {props.problems.map((problem) => (
            <button
              key={problem.id}
              type="button"
              className="w-full rounded-xl border border-white/10 bg-zinc-950/70 p-3 text-left hover:bg-white/5"
              onClick={() => props.onSelectProblem?.(problem)}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className={problem.severity === 'error' ? 'text-xs font-semibold text-red-300' : 'text-xs font-semibold text-amber-300'}>
                  {problem.title}
                </span>
                <span className="text-[10px] text-zinc-500">line {problem.line}</span>
              </div>
              <p className="line-clamp-3 text-xs text-zinc-400">{problem.message}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
