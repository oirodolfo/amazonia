import * as HoverCard from '@radix-ui/react-hover-card';
import {Flame} from 'lucide-react';
import * as React from 'react';
import type {WorkspaceAction, WorkspacePackage} from '@/shared';

interface PackageHoverCardProps {
    readonly workspacePackage: WorkspacePackage;
    readonly actions: readonly WorkspaceAction[];
    readonly children: React.ReactNode;
}

export function PackageHoverCard({workspacePackage, actions, children}: PackageHoverCardProps): React.ReactElement {
    const sortedActions = React.useMemo(
        () => [...actions].sort((left, right) => right.weight - left.weight || left.label.localeCompare(right.label)),
        [actions],
    );

    return (
        <HoverCard.Root openDelay={180} closeDelay={100}>
            <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content side="right" align="start" sideOffset={14}
                                   className="z-50 w-80 rounded-2xl border border-emerald-300/20 bg-zinc-950/95 p-4 text-zinc-100 shadow-[0_0_70px_rgba(16,185,129,.18)] backdrop-blur-xl">
                    <div className="mb-3">
                        <div className="text-sm font-semibold">{workspacePackage.name}</div>
                        <div className="text-xs text-zinc-500">{workspacePackage.relativePath}</div>
                    </div>
                    <div className="space-y-1">
                        {sortedActions.slice(0, 10).map((action) => (
                            <div key={action.id}
                                 className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5 text-xs">
                                <Flame size={12} className="text-emerald-300"/>
                                <span className="truncate">{action.label}</span>
                                <span className="ml-auto text-[10px] text-zinc-500">{action.weight}</span>
                            </div>
                        ))}
                    </div>
                    <HoverCard.Arrow className="fill-emerald-300/20"/>
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    );
}
