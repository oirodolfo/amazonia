import type {WorkspaceActionGroup} from '@/shared/actions/action-types';
import type {RunTimelineEvent} from '@/shared/timeline/run-timeline';
import type {ActionSuggestion} from '@/shared/intelligence/action-intelligence-types';
import {PremiumCard} from '@/renderer/ui/PremiumCard';
import {NeonStatusPill} from '@/renderer/ui/NeonStatusPill';
import {RealTimelinePanel} from '@/renderer/timeline/RealTimelinePanel';
import {WorkspaceGraphPanel} from '@/renderer/workspace-graph/WorkspaceGraphPanel';
import {ActionSuggestionsPanel} from '@/renderer/intelligence/ActionSuggestionsPanel';

export interface BrutalDashboardProps {
    readonly groups: readonly WorkspaceActionGroup[];
    readonly timelineEvents: readonly RunTimelineEvent[];
    readonly suggestions: readonly ActionSuggestion[];
    readonly onRunAction: (actionId: string) => void;
    readonly t: (key: string) => string;
}

/**
 * Renders the v20 premium dashboard with intelligence, timeline and graph.
 *
 * @param props - Dashboard data and callbacks.
 * @returns Premium dashboard element.
 *
 * @example
 * ```tsx
 * <BrutalDashboard groups={groups} timelineEvents={events} suggestions={suggestions} />
 * ```
 */
export function BrutalDashboard(props: BrutalDashboardProps): React.Element {
    const actionCount = props.groups.reduce((total, group) => total + group.actions.length, 0);
    return (
        <div className="min-h-screen bg-[#020605] p-5 text-zinc-100">
            <div
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.13),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(167,139,250,0.11),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(56,189,248,0.10),transparent_30%)]"/>
            <div className="relative mx-auto flex max-w-[1800px] flex-col gap-5">
                <header className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><PremiumCard tone="forest"
                                                                                       eyebrow="Curupira Workbench"
                                                                                       title="Command center"><p
                    className="max-w-3xl text-sm leading-6 text-zinc-400">Premium workspace cockpit with live timeline,
                    smart suggestions, package graph and terminal-first action execution.</p>
                    <div className="mt-5 flex flex-wrap gap-2"><NeonStatusPill tone="forest" label="packages"
                                                                               value={props.groups.length}/><NeonStatusPill
                        tone="info" label="actions" value={actionCount}/><NeonStatusPill tone="warning"
                                                                                         label="timeline events"
                                                                                         value={props.timelineEvents.length}/><NeonStatusPill
                        tone="violet" label="suggestions" value={props.suggestions.length}/></div>
                </PremiumCard><ActionSuggestionsPanel suggestions={props.suggestions} onRunAction={props.onRunAction}
                                                      t={props.t}/></header>
                <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]"><RealTimelinePanel
                    events={props.timelineEvents}/><WorkspaceGraphPanel rootLabel="amazonia" groups={props.groups}
                                                                        onRunAction={props.onRunAction}/></div>
            </div>
        </div>
    );
}
