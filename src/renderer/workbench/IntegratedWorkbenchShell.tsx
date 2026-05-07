import { Panel, Group, Separator } from 'react-resizable-panels';
import type { WorkspaceActionGroup } from '@/shared/actions/action-types';
import type { ActionSuggestion } from '@/shared/intelligence/action-intelligence-types';
import type { IntegratedRuntimeState } from '@/shared/runtime/integrated-runtime-store';
import { ActionSidebar } from '@/renderer/sidebar/ActionSidebar';
import type { SidebarState } from '@/renderer/sidebar/sidebar-state';
import { SmartCommandPalette } from '@/renderer/command/SmartCommandPalette';
import { ActionSuggestionsPanel } from '@/renderer/intelligence/ActionSuggestionsPanel';
import { RealTerminalSurface } from '@/renderer/terminal/RealTerminalSurface';
import { RealTimelinePanel } from '@/renderer/timeline/RealTimelinePanel';
import { WorkspaceGraphPanel } from '@/renderer/workspace-graph/WorkspaceGraphPanel';
import { LiveRuntimeBrainPanel } from '@/renderer/runtime/LiveRuntimeBrainPanel';
import { detectRuntimeBehaviorInsights } from '@/shared/runtime/runtime-intelligence-v2';
import type { RankedWorkspaceAction } from '@/shared/intelligence/action-intelligence-types';
import type { RunTimelineEvent } from '@/shared/timeline/run-timeline';

export interface IntegratedWorkbenchShellProps {
  readonly actionGroups: readonly WorkspaceActionGroup[];
  readonly sidebarState: SidebarState;
  readonly runtimeState: IntegratedRuntimeState;
  readonly timelineEvents: readonly RunTimelineEvent[];
  readonly suggestions: readonly ActionSuggestion[];
  readonly rankedActions: readonly RankedWorkspaceAction[];
  readonly activeSessionId: string | null;
  readonly commandPaletteOpen: boolean;
  readonly onCommandPaletteOpenChange: (open: boolean) => void;
  readonly onRunAction: (actionId: string) => void;
  readonly onQueryChange: (query: string) => void;
  readonly onTerminalInput: (sessionId: string, data: string) => void;
  readonly onTerminalResize: (sessionId: string, cols: number, rows: number) => void;
  readonly t: (key: string) => string;
}

/**
 * Renders the fully wired polished workbench shell.
 *
 * @param props - Integrated shell data and callbacks.
 * @returns Polished workbench shell.
 *
 * @example
 * ```tsx
 * <IntegratedWorkbenchShell runtimeState={state} actionGroups={groups} />
 * ```
 */
export function IntegratedWorkbenchShell(props: IntegratedWorkbenchShellProps): JSX.Element {
  const activeSessionId = props.activeSessionId ?? Object.keys(props.runtimeState.terminalFrames)[0] ?? null;
  const activeFrames = activeSessionId ? props.runtimeState.terminalFrames[activeSessionId] ?? [] : [];
  const timingSamples = props.timelineEvents.map((event) => event.durationMs ?? 0).filter((value) => value > 0);
  const insights = detectRuntimeBehaviorInsights(timingSamples);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#020605] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.11),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(167,139,250,0.10),transparent_32%)]" />

      <SmartCommandPalette
        open={props.commandPaletteOpen}
        suggestions={props.suggestions}
        rankedActions={props.rankedActions}
        onOpenChange={props.onCommandPaletteOpenChange}
        onRunAction={props.onRunAction}
        t={props.t}
      />

      <div className="relative h-full">
        <Group direction="horizontal">
          <Panel minSize={18} defaultSize={22}>
            <div className="flex h-full flex-col gap-3 border-r border-emerald-400/10 bg-zinc-950/70 p-3 backdrop-blur-xl">
              <ActionSuggestionsPanel
                suggestions={props.suggestions}
                onRunAction={props.onRunAction}
                t={props.t}
              />

              <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-emerald-400/10">
                <ActionSidebar
                  groups={props.actionGroups}
                  state={props.sidebarState}
                  onRunAction={props.onRunAction}
                  onQueryChange={props.onQueryChange}
                  t={props.t}
                />
              </div>
            </div>
          </Panel>

          <Separator className="w-1 bg-emerald-400/10 hover:bg-emerald-400/30" />

          <Panel minSize={38} defaultSize={52}>
            <main className="h-full p-3">
              {activeSessionId ? (
                <RealTerminalSurface
                  sessionId={activeSessionId}
                  frames={activeFrames}
                  onInput={props.onTerminalInput}
                  onResize={props.onTerminalResize}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-emerald-400/20 bg-zinc-950/70 text-sm text-zinc-500">
                  Run an action to open the real terminal.
                </div>
              )}
            </main>
          </Panel>

          <Separator className="w-1 bg-emerald-400/10 hover:bg-emerald-400/30" />

          <Panel minSize={24} defaultSize={26}>
            <aside className="flex h-full flex-col gap-3 overflow-auto border-l border-emerald-400/10 bg-zinc-950/70 p-3 backdrop-blur-xl">
              <RealTimelinePanel events={props.timelineEvents} />
              <WorkspaceGraphPanel
                rootLabel="amazonia"
                groups={props.actionGroups}
                onRunAction={props.onRunAction}
              />
              <LiveRuntimeBrainPanel insights={insights} />
            </aside>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
