import {FolderOpen, Play, Search} from 'lucide-react';
import * as React from 'react';
import type {WorkspaceAction, WorkspaceManifest, WorkspacePackage} from '@/shared';
import {Button, Card} from '@/renderer/components/ui';
import {PackageHoverCard} from '@/renderer/components/actions/PackageHoverCard';
import {t} from '@/renderer/i18n/messages';

interface ActionSidebarProps {
    readonly workspace: WorkspaceManifest | null;
    readonly onOpenWorkspace: () => void;
    readonly onRunAction: (action: WorkspaceAction) => void;
    readonly onFocusPackage: (workspacePackage: WorkspacePackage) => void;
}

export function ActionSidebar({
                                  workspace,
                                  onOpenWorkspace,
                                  onRunAction,
                                  onFocusPackage
                              }: ActionSidebarProps): React.ReactElement {
    const [query, setQuery] = React.useState('');
    const actions = React.useMemo(() => workspace?.actions.filter((action) => `${action.packageName} ${action.label}`.toLowerCase().includes(query.toLowerCase())) ?? [], [query, workspace]);

    return (
        <aside className="flex h-full flex-col gap-4 border-r border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-white">{t('app.title')}</h1>
                    <p className="text-xs text-emerald-200/70">dual-runtime action runner</p>
                </div>
            </div>
            <Button onClick={onOpenWorkspace}><FolderOpen size={16}/>{t('sidebar.openWorkspace')}</Button>
            <label
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                <Search size={15}/>
                <input className="w-full bg-transparent outline-none placeholder:text-zinc-600"
                       placeholder={t('sidebar.searchPlaceholder')} value={query}
                       onChange={(event) => setQuery(event.target.value)}/>
            </label>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
                {workspace?.packages.map((workspacePackage) => {
                    const packageActions = actions.filter((action) => action.packageId === workspacePackage.id);
                    if (packageActions.length === 0) return null;
                    return (
                        <PackageHoverCard key={workspacePackage.id} workspacePackage={workspacePackage}
                                          actions={packageActions}>
                            <Card className="p-3" onMouseEnter={() => onFocusPackage(workspacePackage)}>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div
                                            className="truncate text-sm font-medium text-zinc-100">{workspacePackage.name}</div>
                                        <div
                                            className="truncate text-xs text-zinc-500">{workspacePackage.relativePath}</div>
                                    </div>
                                    <span
                                        className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200">{packageActions.length}</span>
                                </div>
                                <div className="space-y-1">
                                    {packageActions.slice(0, 8).map((action) => (
                                        <button key={action.id} onClick={() => onRunAction(action)}
                                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-zinc-300 transition hover:bg-emerald-400/10 hover:text-emerald-100">
                                            <Play size={12}/>
                                            <span className="truncate">{action.label}</span>
                                            <span className="ml-auto text-[10px] text-zinc-600">{action.kind}</span>
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </PackageHoverCard>
                    );
                })}
            </div>
        </aside>
    );
}
