import type {ActionSuggestion} from '@/shared/intelligence/action-intelligence-types';

export interface ActionSuggestionsPanelProps {
    readonly suggestions: readonly ActionSuggestion[];
    readonly onRunAction: (actionId: string) => void;
    readonly t: (key: string) => string;
}

/**
 * Renders smart suggested actions near the sidebar.
 *
 * @param props - Suggested actions and callbacks.
 * @returns Suggestion panel.
 *
 * @example
 * ```tsx
 * <ActionSuggestionsPanel suggestions={suggestions} onRunAction={runAction} />
 * ```
 */
export function ActionSuggestionsPanel(props: ActionSuggestionsPanelProps): React.ReactElement | null {
    if (props.suggestions.length === 0) {
        return null;
    }

    return (
        <section
            className="rounded-3xl border border-emerald-400/10 bg-zinc-950/80 p-4 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
            <h2 className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">
                {props.t('intelligence.suggested')}
            </h2>

            <div className="mt-3 space-y-2">
                {props.suggestions.map((suggestion) => (
                    <button
                        key={suggestion.id}
                        type="button"
                        className="w-full rounded-2xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3 text-left hover:bg-emerald-400/10"
                        onClick={() => props.onRunAction(suggestion.actionId)}
                    >
                        <span className="block text-sm font-semibold text-emerald-50">{suggestion.title}</span>
                        <span className="mt-1 block text-xs text-zinc-500">{suggestion.subtitle}</span>
                        <span
                            className="mt-2 block text-[11px] text-emerald-300/80">{suggestion.reasons.join(' · ')}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
