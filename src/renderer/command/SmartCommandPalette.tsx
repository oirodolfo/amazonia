import {Command} from 'cmdk';
import type {ActionSuggestion, RankedWorkspaceAction} from '@/shared/intelligence/action-intelligence-types';

export interface SmartCommandPaletteProps {
    readonly open: boolean;
    readonly suggestions: readonly ActionSuggestion[];
    readonly rankedActions: readonly RankedWorkspaceAction[];
    readonly onOpenChange: (open: boolean) => void;
    readonly onRunAction: (actionId: string) => void;
    readonly t: (key: string) => string;
}

/**
 * Renders the intelligence-powered command palette.
 *
 * @param props - Palette state, ranked actions and suggestions.
 * @returns Command palette element.
 *
 * @example
 * ```tsx
 * <SmartCommandPalette open={open} rankedActions={rankedActions} suggestions={suggestions} />
 * ```
 */
export function SmartCommandPalette(props: SmartCommandPaletteProps): React.ReactElement | null {
    if (!props.open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 p-[8vh] backdrop-blur-xl"
             onClick={() => props.onOpenChange(false)}>
            <Command
                className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-zinc-950 shadow-2xl shadow-emerald-950/50"
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
                <Command.Input
                    className="w-full border-b border-emerald-400/10 bg-transparent px-6 py-5 text-base text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder={props.t('command.smartPlaceholder')}
                />

                <Command.List className="max-h-[65vh] overflow-auto p-3">
                    <Command.Empty className="p-8 text-center text-sm text-zinc-500">
                        {props.t('command.empty')}
                    </Command.Empty>

                    {props.suggestions.length > 0 ? (
                        <Command.Group heading={props.t('command.suggested')}>
                            {props.suggestions.map((suggestion) => (
                                <Command.Item
                                    key={suggestion.id}
                                    value={`${suggestion.title} ${suggestion.subtitle} ${suggestion.reasons.join(' ')}`}
                                    className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm text-zinc-300 aria-selected:bg-emerald-400/10 aria-selected:text-emerald-50"
                                    onSelect={() => {
                                        props.onRunAction(suggestion.actionId);
                                        props.onOpenChange(false);
                                    }}
                                >
                  <span>
                    <span className="block font-semibold text-emerald-50">🔥 {suggestion.title}</span>
                    <span className="mt-1 block text-xs text-zinc-500">{suggestion.subtitle}</span>
                    <span className="mt-1 block text-[11px] text-emerald-300/80">{suggestion.reasons.join(' · ')}</span>
                  </span>
                                    <span
                                        className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-xs text-emerald-300">
                    {Math.round(suggestion.score)}
                  </span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    ) : null}

                    <Command.Group heading={props.t('command.allRankedActions')}>
                        {props.rankedActions.map((ranked) => (
                            <Command.Item
                                key={ranked.action.id}
                                value={`${ranked.action.packageName} ${ranked.action.label} ${ranked.action.command} ${ranked.reasons.join(' ')}`}
                                className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm text-zinc-300 aria-selected:bg-emerald-400/10 aria-selected:text-emerald-50"
                                onSelect={() => {
                                    props.onRunAction(ranked.action.id);
                                    props.onOpenChange(false);
                                }}
                            >
                <span>
                  <span className="block font-medium">{ranked.action.label}</span>
                  <span className="block text-xs text-zinc-500">{ranked.action.packageName}</span>
                </span>
                                <span className="rounded-xl border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400">
                  {ranked.intent} · {Math.round(ranked.score)}
                </span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                </Command.List>
            </Command>
        </div>
    );
}
