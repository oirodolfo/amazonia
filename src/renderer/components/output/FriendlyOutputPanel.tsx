import {AlertTriangle, CheckCircle2, ExternalLink, XCircle} from 'lucide-react';
import * as React from 'react';
import type {FriendlyOutputCard} from '@/shared';
import {Card} from '@/renderer/components/ui';
import {t} from '@/renderer/i18n/messages';
import {RunTimeline} from './RunTimeline';

interface FriendlyOutputPanelProps {
    readonly cards: readonly FriendlyOutputCard[];
}

/**
 * Shows friendly run cards, diagnostics and a compact timeline beside the terminal.
 *
 * @param props - Recent output cards generated from terminal output.
 * @returns The friendly output side panel.
 *
 * @example
 * ```tsx
 * <FriendlyOutputPanel cards={cards} />
 * ```
 */
export function FriendlyOutputPanel({cards}: FriendlyOutputPanelProps): React.ReactElement {
    return (
        <aside className="flex h-full flex-col gap-4 border-l border-white/10 bg-black/30 p-4">
            <div>
                <h2 className="text-sm font-semibold text-white">{t('output.title')}</h2>
                <p className="text-xs text-zinc-500">DevTools-style cards for terminal runs</p>
            </div>
            <RunTimeline cards={cards}/>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
                {cards.length === 0 ? <div
                    className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-500">{t('output.noRuns')}</div> : null}
                {cards.map((card) => (
                    <Card key={card.id} className="p-4">
                        <div className="mb-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-zinc-100">{card.command}</div>
                                <div className="truncate text-xs text-zinc-500">{card.cwd}</div>
                            </div>
                            <StatusBadge status={card.status}/>
                        </div>
                        <div className="mb-3 grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                            <Metric label="Duration" value={`${card.durationMs ?? 0}ms`}/>
                            <Metric label="Exit" value={card.exitCode === undefined ? 'n/a' : String(card.exitCode)}/>
                            <Metric label="Links" value={String(card.links.length)}/>
                        </div>
                        <div className="space-y-2">
                            {card.diagnostics.slice(0, 8).map((diagnostic, index) => (
                                <div key={`${card.id}-${index}`}
                                     className="rounded-xl border border-white/5 bg-zinc-950/70 p-2 text-xs text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        {diagnostic.level === 'error' ? <XCircle size={13}
                                                                                 className="text-red-300"/> : diagnostic.level === 'warning' ?
                                            <AlertTriangle size={13} className="text-amber-300"/> :
                                            <CheckCircle2 size={13} className="text-emerald-300"/>}
                                        <span className="line-clamp-2">{diagnostic.message}</span>
                                    </div>
                                    {diagnostic.filePath !== undefined ?
                                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-200">
                                            <ExternalLink size={11}/>{diagnostic.filePath}:{diagnostic.line ?? 1}
                                        </div> : null}
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </aside>
    );
}

function Metric({label, value}: { readonly label: string; readonly value: string }): React.ReactElement {
    return <div className="rounded-xl bg-white/[0.03] p-2">
        <div className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</div>
        <div className="text-zinc-200">{value}</div>
    </div>;
}

function StatusBadge({status}: Pick<FriendlyOutputCard, 'status'>): React.ReactElement {
    const className = status === 'success' ? 'bg-emerald-400/10 text-emerald-200' : status === 'failed' ? 'bg-red-400/10 text-red-200' : 'bg-zinc-400/10 text-zinc-300';
    return <span className={`rounded-full px-2 py-1 text-[10px] ${className}`}>{status}</span>;
}
