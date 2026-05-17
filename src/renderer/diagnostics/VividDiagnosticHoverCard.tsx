import type {VividDiagnosticHoverModel} from '@/shared/diagnostics/vivid-diagnostic-hover';
import {PremiumCard} from '@/renderer/ui/PremiumCard';

export interface VividDiagnosticHoverCardProps {
    readonly diagnostic: VividDiagnosticHoverModel;
    readonly onAction?: (diagnosticId: string, actionId: string) => void;
}

/**
 * Renders a vivid diagnostic hover card with actions and preview lines.
 *
 * @param props - Diagnostic hover model and action callback.
 * @returns Diagnostic hover card.
 *
 * @example
 * ```tsx
 * <VividDiagnosticHoverCard diagnostic={diagnostic} />
 * ```
 */
export function VividDiagnosticHoverCard(props: VividDiagnosticHoverCardProps): React.ReactElement {
    const {diagnostic} = props;

    return (
        <PremiumCard tone={diagnostic.accentTone} eyebrow={diagnostic.severity} title={diagnostic.title}
                     className="w-[28rem]">
            <p className="text-xs leading-5 text-zinc-400">{diagnostic.subtitle}</p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/45 p-3 font-mono text-xs">
                {diagnostic.previewLines.map((line, index) => (
                    <div key={`${line}-${index}`} className="grid grid-cols-[2rem_1fr] gap-3">
                        <span
                            className="select-none text-zinc-600">{diagnostic.line ? diagnostic.line + index : index + 1}</span>
                        <span className="text-zinc-200">{line}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {diagnostic.actions.map((action) => (
                    <button key={action.id} type="button"
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"
                            onClick={() => props.onAction?.(diagnostic.id, action.id)}>
                        {action.label}
                        {action.shortcut ? <span className="ml-2 text-zinc-500">{action.shortcut}</span> : null}
                    </button>
                ))}
            </div>
        </PremiumCard>
    );
}
