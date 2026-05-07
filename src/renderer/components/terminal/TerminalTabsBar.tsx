import * as React from 'react';
import type {TerminalTab} from '@/shared/types';

export interface TerminalTabsBarProps {
    readonly tabs: readonly TerminalTab[];
    readonly activeTabId: string | null;
    readonly onSelectTab: (tabId: string) => void;
    readonly onCloseTab: (tabId: string) => void;
}

/**
 * Renders terminal tabs with lightweight status pills.
 *
 * @param props - Terminal tab state and event handlers.
 * @returns A compact tab strip for the workbench terminal area.
 *
 * @example
 * ```tsx
 * <TerminalTabsBar tabs={[]} activeTabId={null} onSelectTab={() => {}} onCloseTab={() => {}} />
 * ```
 */
export function TerminalTabsBar(props: TerminalTabsBarProps): React.ReactElement {
    if (props.tabs.length === 0) {
        return <div className="rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-zinc-500">No
            terminal tabs yet. Run an action or open a shell.</div>;
    }

    return (
        <div
            className="flex h-10 items-center gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/30 px-2 shadow-[0_0_28px_rgba(16,185,129,.06)]">
            {props.tabs.map((tab) => (
                <div key={tab.id}
                     className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${tab.id === props.activeTabId ? 'bg-emerald-400/15 text-emerald-100' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'}`}>
                    <button type="button" onClick={() => props.onSelectTab(tab.id)}>{tab.title}</button>
                    <span
                        className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[.18em] text-zinc-400">{tab.status}</span>
                    <button type="button" onClick={() => props.onCloseTab(tab.id)}
                            className="opacity-0 transition group-hover:opacity-100">×
                    </button>
                </div>
            ))}
        </div>
    );
}
