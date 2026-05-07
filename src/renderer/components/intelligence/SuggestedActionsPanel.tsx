import type {SuggestedAction} from '@/intelligence';

export interface SuggestedActionsPanelProps {
    readonly suggestions: readonly SuggestedAction[];
    readonly onRun: (actionId: string) => void;
}

/**
 * Displays locally ranked action suggestions for fast repeated workflows.
 *
 * @param props - Suggested action list and run callback.
 * @returns A React panel for the workbench sidebar or command palette.
 *
 * @example
 * ```tsx
 * <SuggestedActionsPanel suggestions={suggestions} onRun={runAction} />
 * ```
 */
export function SuggestedActionsPanel({suggestions, onRun}: SuggestedActionsPanelProps): React.Element {
    return (
        <section className="rounded-2xl border border-cyan-400/20 bg-zinc-950/60 p-3">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-200/70">Frequent trails</p>
            <div className="space-y-2">
                {suggestions.slice(0, 8).map(({action, reason, score}) => (
                    <button
                        key={action.id}
                        type="button"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
                        onClick={() => onRun(action.id)}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-zinc-100">{action.label}</span>
                            <span className="text-[11px] text-cyan-200">{Math.round(score)}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-zinc-500">
                            <span>{action.packageName}</span>
                            <span>{reason}</span>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
