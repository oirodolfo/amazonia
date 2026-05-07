import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import * as React from 'react';
import type { FriendlyOutputCard, TerminalTab, WorkspaceAction, WorkspaceManifest, WorkspacePackage } from '@/shared';
import { ActionSidebar } from '@/renderer/components/actions/ActionSidebar';
import { CommandPalette } from '@/renderer/components/command/CommandPalette';
import { ActionGraphPanel } from '@/renderer/components/graph/ActionGraphPanel';
import { FriendlyOutputPanel } from '@/renderer/components/output/FriendlyOutputPanel';
import { TerminalPane } from '@/renderer/components/terminal/TerminalPane';
import { TerminalTabsBar } from '@/renderer/components/terminal/TerminalTabsBar';
import { bridge } from '@/renderer/bridge';
import { createActionRunPlan, finishRun } from '@/runs';
import { createFriendlyOutputCard } from '@/output';
import { createTerminalCommandPlan, TerminalOrchestrator } from '@/terminal';

/**
 * Main workbench layout for Electron and Web runtime.
 *
 * @returns The full Curupira Workbench UI shell.
 *
 * @example
 * ```tsx
 * <WorkbenchLayout />
 * ```
 */
export function WorkbenchLayout(): React.ReactElement {
  const [workspace, setWorkspace] = React.useState<WorkspaceManifest | null>(null);
  const [tabs, setTabs] = React.useState<readonly TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [cards, setCards] = React.useState<readonly FriendlyOutputCard[]>([]);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const outputChunksRef = React.useRef(new Map<string, string[]>());
  const runsRef = React.useRef(new Map<string, ReturnType<typeof createActionRunPlan>['run']>());
  const orchestratorRef = React.useRef(new TerminalOrchestrator());

  React.useEffect(() => bridge.onEvent((event) => {
    if (event.type === 'workspace:changed') setWorkspace(event.workspace);
    if (event.type === 'terminal:data') {
      outputChunksRef.current.set(event.tabId, [...(outputChunksRef.current.get(event.tabId) ?? []), event.data]);
      orchestratorRef.current.patch(event.tabId, { status: 'running', outputBytesDelta: event.data.length });
      setTabs(orchestratorRef.current.toTabs());
    }
    if (event.type === 'terminal:exit') {
      orchestratorRef.current.patch(event.tabId, { status: event.exitCode === 0 ? 'exited' : 'crashed', lastExitCode: event.exitCode });
      const run = runsRef.current.get(event.tabId);
      if (run !== undefined) {
        const finished = finishRun(run, event.exitCode);
        void bridge.recordRun(finished);
        const card = createFriendlyOutputCard(finished, outputChunksRef.current.get(event.tabId) ?? []);
        setCards((current) => [card, ...current].slice(0, 30));
      }
      setTabs(orchestratorRef.current.toTabs());
    }
  }), []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function openWorkspace(): Promise<void> {
    const nextWorkspace = await bridge.openWorkspace();
    if (nextWorkspace !== null) setWorkspace(nextWorkspace);
  }

  async function runAction(action: WorkspaceAction): Promise<void> {
    const plan = createActionRunPlan(action);
    const terminalPlan = createTerminalCommandPlan(action, plan.run.startedAtIso);
    const tab = orchestratorRef.current.create({ id: plan.run.id, title: terminalPlan.title, cwd: terminalPlan.cwd, command: terminalPlan.command, status: 'running', createdAtIso: plan.run.startedAtIso });
    runsRef.current.set(tab.id, plan.run);
    setTabs(orchestratorRef.current.toTabs());
    setActiveTabId(tab.id);
    await bridge.spawnTerminal({ tabId: tab.id, cwd: terminalPlan.cwd, command: terminalPlan.command, cols: terminalPlan.cols, rows: terminalPlan.rows });
  }

  function focusPackage(_workspacePackage: WorkspacePackage): void {
    // Package focus is intentionally lightweight; hover cards and graph panel share the same workspace manifest.
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null;

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.10),transparent_30%),linear-gradient(135deg,#05070a,#09090b_45%,#06110d)] text-zinc-100">
      <PanelGroup direction="horizontal" className="h-full" onLayout={(sizes) => { if (sizes.length === 3) void bridge.persistLayout({ sidebarSize: sizes[0] ?? 22, terminalSize: sizes[1] ?? 52, outputSize: sizes[2] ?? 26 }); }}>
        <Panel defaultSize={22} minSize={16} maxSize={34}><ActionSidebar workspace={workspace} onOpenWorkspace={() => void openWorkspace()} onRunAction={(action) => void runAction(action)} onFocusPackage={focusPackage} /></Panel>
        <PanelResizeHandle className="w-1 bg-white/5 transition hover:bg-emerald-400/40" />
        <Panel defaultSize={52} minSize={32}>
          <main className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-4">
            <TerminalTabsBar tabs={tabs} activeTabId={activeTab?.id ?? null} onSelectTab={setActiveTabId} onCloseTab={(tabId) => { void bridge.killTerminal(tabId); orchestratorRef.current.remove(tabId); setTabs(orchestratorRef.current.toTabs()); }} />
            <div className="min-h-0"><TerminalPane activeTab={activeTab} /></div>
            <ActionGraphPanel workspace={workspace} />
          </main>
        </Panel>
        <PanelResizeHandle className="w-1 bg-white/5 transition hover:bg-emerald-400/40" />
        <Panel defaultSize={26} minSize={18}><FriendlyOutputPanel cards={cards} /></Panel>
      </PanelGroup>
      <CommandPalette open={paletteOpen} workspace={workspace} onOpenChange={setPaletteOpen} onRunAction={(action) => void runAction(action)} />
    </div>
  );
}
