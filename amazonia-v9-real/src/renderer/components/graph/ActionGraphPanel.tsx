import * as React from 'react';
import type { WorkspaceManifest } from '@/shared';
import { t } from '@/renderer/i18n/messages';

interface ActionGraphPanelProps {
  readonly workspace: WorkspaceManifest | null;
}

/**
 * Displays a lightweight package-to-action graph without adding a heavy graph dependency yet.
 *
 * @param props - Workspace manifest containing packages and actions.
 * @returns A visual action graph panel.
 *
 * @example
 * ```tsx
 * <ActionGraphPanel workspace={workspace} />
 * ```
 */
export function ActionGraphPanel({ workspace }: ActionGraphPanelProps): React.ReactElement {
  if (workspace === null) {
    return <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-zinc-500">{t('graph.empty')}</div>;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">{t('graph.title')}</h2>
      <div className="space-y-2">
        {workspace.packages.slice(0, 6).map((workspacePackage) => {
          const actions = workspace.actions.filter((action) => action.packageId === workspacePackage.id).slice(0, 5);
          return (
            <div key={workspacePackage.id} className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <div className="mb-2 truncate text-xs font-medium text-zinc-200">{workspacePackage.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {actions.map((action) => <span key={action.id} className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-100">{action.label}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
