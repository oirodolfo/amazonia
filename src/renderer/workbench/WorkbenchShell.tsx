import {Group, Panel, Separator} from 'react-resizable-panels';
import type {WorkspaceAction} from '@/shared';
import type {FriendlyOutputCard as FriendlyOutputCardModel} from './workbench-state';
import {ActionSidebar} from '@/renderer/components/actions/ActionSidebar';
import type {SidebarState} from '@/renderer/sidebar/sidebar-state';
import type {TerminalTabsState} from '@/renderer/terminal/terminal-tabs-state';
import {TerminalTabsBar} from '@/renderer/terminal/TerminalTabsBar';
import {XtermTerminalView} from '@/renderer/terminal/XtermTerminalView';
import {FriendlyOutputCard} from '@/renderer/output/FriendlyOutputCard';

export interface WorkbenchShellProps {
    readonly actionGroups: readonly WorkspaceAction[];
    readonly sidebarState: SidebarState;
    readonly terminalTabs: TerminalTabsState;
    readonly outputCards: readonly FriendlyOutputCardModel[];
    readonly onRunAction: (actionId: string) => void;
    readonly onQueryChange: (query: string) => void;
    readonly onTerminalInput: (sessionId: string, data: string) => void;
    readonly onTerminalResize: (sessionId: string, cols: number, rows: number) => void;
    readonly onCloseTerminal: (sessionId: string) => void;
    readonly onRestartTerminal: (sessionId: string) => void;
    readonly t: (key: string) => string;
}

/**
 * Renders the complete Warp/DevTools-inspired workbench shell.
 *
 * @param props - Workbench shell model and callbacks.
 * @returns The main workbench layout.
 *
 * @example
 * ```tsx
 * <WorkbenchShell actionGroups={groups} terminalTabs={tabs} outputCards={cards} />
 * ```
 */
export function WorkbenchShell(props: WorkbenchShellProps): React.ReactElement {
    const activeSession = props.terminalTabs.sessions.find((session) => session.id === props.terminalTabs.activeSessionId);

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#030706] text-zinc-100">
            <Group orientation="horizontal">
                <Panel minSize={18} defaultSize={24}>
                    <ActionSidebar groups={props.actionGroups} state={props.sidebarState}
                                   onRunAction={props.onRunAction} onQueryChange={props.onQueryChange} t={props.t}/>
                </Panel>
                <Separator className="w-1 bg-emerald-400/10 hover:bg-emerald-400/30"/>
                <Panel minSize={35} defaultSize={50}>
                    <main className="flex h-full flex-col">
                        <TerminalTabsBar sessions={props.terminalTabs.sessions}
                                         activeSessionId={props.terminalTabs.activeSessionId}
                                         onClose={props.onCloseTerminal} onRestart={props.onRestartTerminal}/>
                        <div className="flex-1 p-3">
                            {activeSession ? (
                                <XtermTerminalView sessionId={activeSession.id} onInput={props.onTerminalInput}
                                                   onResize={props.onTerminalResize}/>
                            ) : (
                                <div
                                    className="flex h-full items-center justify-center rounded-3xl border border-dashed border-emerald-400/20 bg-zinc-950/60 text-sm text-zinc-500">
                                    {props.t('terminal.empty')}
                                </div>
                            )}
                        </div>
                    </main>
                </Panel>
                <Separator className="w-1 bg-emerald-400/10 hover:bg-emerald-400/30"/>
                <Panel minSize={20} defaultSize={26}>
                    <aside className="h-full overflow-auto border-l border-emerald-400/10 bg-zinc-950/70 p-3">
                        <h2 className="mb-3 text-xs uppercase tracking-[0.25em] text-emerald-300/70">{props.t('output.title')}</h2>
                        <div className="space-y-3">{props.outputCards.map((card) => <FriendlyOutputCard key={card.id}
                                                                                                        card={card}/>)}</div>
                    </aside>
                </Panel>
            </Group>
        </div>
    );
}
