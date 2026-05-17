import {Play, Search} from 'lucide-react';
import * as React from 'react';
import type {WorkspaceActionGroup} from '@/shared/actions/action-types';
import type {SidebarState} from '@/renderer/workbench/sidebar/sidebar-state';
import {Card} from '@/renderer/components/ui';

export interface GroupedActionSidebarProps {
    readonly groups: readonly WorkspaceActionGroup[];
    readonly state: SidebarState;
    readonly onRunAction: (actionId: string) => void;
    readonly onQueryChange: (query: string) => void;
    readonly t: (key: string) => string;
}

/**
 * Sidebar listing actions grouped by package (integrated / Warp shell).
 */
export function GroupedActionSidebar(props: GroupedActionSidebarProps): React.ReactElement {
    const [query, setQuery] = React.useState(props.state.searchQuery);

    const filteredGroups = React.useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (needle.length === 0) {
            return props.groups;
        }

        return props.groups
            .map((group) => ({
                ...group,
                actions: group.actions.filter((action) =>
                    `${action.packageName} ${action.label} ${action.command}`.toLowerCase().includes(needle),
                ),
            }))
            .filter((group) => group.actions.length > 0);
    }, [props.groups, query]);

    return (
        <div className="flex h-full flex-col gap-3">
            <label
                className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-300">
                <Search size={15}/>
                <input
                    className="w-full bg-transparent outline-none placeholder:text-zinc-600"
                    placeholder={props.t('sidebar.searchPlaceholder')}
                    value={query}
                    onChange={(event) => {
                        const next = event.target.value;
                        setQuery(next);
                        props.onQueryChange(next);
                    }}
                />
            </label>

            <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
                {filteredGroups.map((group) => (
                    <Card key={group.packageId} className="p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-zinc-100">{group.packageName}</div>
                                <div className="truncate text-xs text-zinc-500">{group.packagePath}</div>
                            </div>
                            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200">
                                {group.actions.length}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {group.actions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={() => props.onRunAction(action.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-zinc-300 transition hover:bg-emerald-400/10 hover:text-emerald-100">
                                    <Play size={12}/>
                                    <span className="truncate">{action.label}</span>
                                    <span className="ml-auto text-[10px] text-zinc-600">{action.kind}</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
