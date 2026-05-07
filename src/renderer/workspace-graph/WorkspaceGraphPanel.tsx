import { buildWorkspaceGraph, getCentralWorkspacePackages } from '@/shared/workspace-graph/workspace-graph-builder';
import type { WorkspaceActionGroup } from '@/shared/actions/action-types';
import { PremiumCard } from '@/renderer/ui/PremiumCard';
import { NeonStatusPill } from '@/renderer/ui/NeonStatusPill';

export interface WorkspaceGraphPanelProps {
  readonly rootLabel: string;
  readonly groups: readonly WorkspaceActionGroup[];
  readonly onRunAction: (actionId: string) => void;
}

/**
 * Renders a premium workspace graph explorer.
 *
 * @param props - Workspace graph input and action runner.
 * @returns Workspace graph panel.
 *
 * @example
 * ```tsx
 * <WorkspaceGraphPanel rootLabel="amazonia" groups={groups} onRunAction={runAction} />
 * ```
 */
export function WorkspaceGraphPanel(props: WorkspaceGraphPanelProps): React.Element {
  const graph = buildWorkspaceGraph({ rootLabel: props.rootLabel, groups: props.groups });
  const centralPackages = getCentralWorkspacePackages(graph);
  const actionNodes = graph.nodes.filter((node) => node.kind === 'action');
  return (
    <PremiumCard tone="violet" eyebrow="Workspace Graph" title="Packages, Actions & Tools">
      <div className="mb-4 flex flex-wrap items-center gap-2"><NeonStatusPill tone="violet" label="nodes" value={graph.nodes.length} /><NeonStatusPill tone="info" label="edges" value={graph.edges.length} /><NeonStatusPill tone="forest" label="packages" value={centralPackages.length} /></div>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-violet-400/10 bg-black/30 p-4"><h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-violet-300/80">central packages</h3><div className="space-y-2">{centralPackages.map((node) => (<div key={node.id} className="rounded-2xl border border-violet-400/10 bg-violet-400/5 p-3"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold text-violet-50">{node.label}</span><span className="rounded-full bg-black/40 px-2 py-1 text-xs text-violet-300">{node.weight}</span></div><p className="mt-1 truncate text-xs text-zinc-500">{String(node.metadata.path ?? '')}</p></div>))}</div></div>
        <div className="relative min-h-96 overflow-hidden rounded-2xl border border-emerald-400/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_35%),rgba(0,0,0,0.32)] p-4"><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" /><div className="relative grid grid-cols-2 gap-3 lg:grid-cols-3">{actionNodes.slice(0, 18).map((node) => (<button key={node.id} type="button" className="rounded-2xl border border-emerald-400/10 bg-zinc-950/80 px-3 py-3 text-left shadow-[0_0_30px_rgba(16,185,129,0.08)] transition hover:border-emerald-300/30 hover:bg-emerald-400/10" onClick={() => props.onRunAction(node.id)}><span className="block truncate text-sm font-medium text-emerald-50">{node.label}</span><span className="mt-1 block truncate text-[11px] text-zinc-500">{String(node.metadata.tool ?? 'action')}</span></button>))}</div></div>
      </div>
    </PremiumCard>
  );
}
