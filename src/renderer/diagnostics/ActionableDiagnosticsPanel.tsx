import type {
  ActionableDiagnostic,
  DiagnosticSuggestedAction,
} from '@/shared/diagnostics/actionable-diagnostic-types';

export interface ActionableDiagnosticsPanelProps {
  readonly diagnostics: readonly ActionableDiagnostic[];
  readonly onOpenLocation: (diagnostic: ActionableDiagnostic) => void;
  readonly onPinCommand: (diagnostic: ActionableDiagnostic, action: DiagnosticSuggestedAction) => void;
  readonly onRunCommand: (command: string) => void;
}

/**
 * Renders actionable diagnostics with fix, pin, rerun and open-in-editor actions.
 *
 * @param props - Diagnostics and callbacks.
 * @returns Diagnostics panel.
 *
 * @example
 * ```tsx
 * <ActionableDiagnosticsPanel diagnostics={diagnostics} />
 * ```
 */
export function ActionableDiagnosticsPanel(
  props: ActionableDiagnosticsPanelProps,
): React.Element {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-red-400/10 bg-[#141414]">
      <header className="border-b border-white/5 px-5 py-4">
        <h2 className="text-xs uppercase tracking-[0.24em] text-red-300/70">
          Actionable Diagnostics
        </h2>
      </header>

      <div className="max-h-[34rem] overflow-auto p-4">
        <div className="space-y-4">
          {props.diagnostics.map((diagnostic) => (
            <article
              key={diagnostic.id}
              className="rounded-3xl border border-white/5 bg-[#1a1a1a] p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-red-400/10 px-2 py-1 text-[10px] uppercase text-red-300">
                      {diagnostic.source}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase text-zinc-400">
                      {diagnostic.severity}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100">
                    {diagnostic.title}
                  </h3>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
                  onClick={() => props.onOpenLocation(diagnostic)}
                  disabled={!diagnostic.location}
                >
                  Open editor
                </button>
              </div>

              <p className="mb-4 text-xs leading-5 text-zinc-400">
                {diagnostic.message}
              </p>

              {diagnostic.location ? (
                <code className="mb-4 block rounded-xl bg-black/40 px-3 py-2 text-xs text-emerald-300">
                  {diagnostic.location.file}:{diagnostic.location.line ?? 1}:{diagnostic.location.column ?? 1}
                </code>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {diagnostic.suggestedActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={
                      action.kind === 'pin-command'
                        ? 'rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20'
                        : action.kind === 'run-command'
                          ? 'rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20'
                          : 'rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5'
                    }
                    onClick={() => {
                      if (action.kind === 'open-editor') {
                        props.onOpenLocation(diagnostic);
                        return;
                      }

                      if (action.kind === 'pin-command') {
                        props.onPinCommand(diagnostic, action);
                        return;
                      }

                      if (action.command) {
                        props.onRunCommand(action.command);
                      }
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
