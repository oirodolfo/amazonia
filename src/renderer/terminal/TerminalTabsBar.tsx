import type {TerminalSessionSnapshot} from '@/shared/runtime/runtime-types';

export interface TerminalTabsBarProps {
    readonly sessions: readonly TerminalSessionSnapshot[];
    readonly activeSessionId: string | null;
    readonly onClose: (sessionId: string) => void;
    readonly onRestart: (sessionId: string) => void;
}

/**
 * Renders terminal tabs with close and restart actions.
 *
 * @param props - Terminal tabs state and callbacks.
 * @returns Terminal tabs bar.
 *
 * @example
 * ```tsx
 * <TerminalTabsBar sessions={sessions} activeSessionId={activeId} />
 * ```
 */
export function TerminalTabsBar(props: TerminalTabsBarProps): React.Element {
    return (
        <div className="flex h-12 items-center gap-2 border-b border-emerald-400/10 bg-zinc-950/80 px-3">
            {props.sessions.map((session) => (
                <div key={session.id} className={[
                    'flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs',
                    session.id === props.activeSessionId ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50' : 'border-zinc-800 bg-zinc-900 text-zinc-400',
                ].join(' ')}>
                    <span className="max-w-44 truncate">{session.title}</span>
                    <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[10px] uppercase">{session.status}</span>
                    <button type="button" onClick={() => props.onRestart(session.id)} className="text-emerald-300">↻
                    </button>
                    <button type="button" onClick={() => props.onClose(session.id)} className="text-red-300">×</button>
                </div>
            ))}
        </div>
    );
}
