import type { PinnedDiagnosticCommand } from '@/shared/diagnostics/actionable-diagnostic-types';

export interface PinnedCommandsPanelProps {
  readonly commands: readonly PinnedDiagnosticCommand[];
  readonly onRunCommand: (command: string) => void;
  readonly onUnpinCommand: (commandId: string) => void;
}

/**
 * Renders pinned diagnostic commands that can be re-run.
 *
 * @param props - Pinned commands and callbacks.
 * @returns Pinned commands panel.
 *
 * @example
 * ```tsx
 * <PinnedCommandsPanel commands={commands} />
 * ```
 */
export function PinnedCommandsPanel(props: PinnedCommandsPanelProps): JSX.Element {
  return (
    <section className="rounded-[1.5rem] border border-emerald-400/10 bg-[#141414] p-4">
      <h2 className="mb-3 text-xs uppercase tracking-[0.24em] text-emerald-300/70">
        Pinned Fix Commands
      </h2>

      <div className="space-y-2">
        {props.commands.map((command) => (
          <article
            key={command.id}
            className="rounded-2xl border border-white/5 bg-black/30 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-zinc-200">
                {command.label}
              </span>
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-red-300"
                onClick={() => props.onUnpinCommand(command.id)}
              >
                unpin
              </button>
            </div>

            <code className="mb-3 block rounded-xl bg-black/40 px-3 py-2 text-xs text-emerald-300">
              {command.command}
            </code>

            <button
              type="button"
              className="rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
              onClick={() => props.onRunCommand(command.command)}
            >
              Run again
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
