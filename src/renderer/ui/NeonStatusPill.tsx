import {cx, getPremiumSurfaceTokens, type PremiumTone} from '@/shared/ui/premium-theme';

export interface NeonStatusPillProps {
    readonly tone?: PremiumTone;
    readonly label: string;
    readonly value?: string | number;
}

/**
 * Renders a compact neon status pill.
 *
 * @param props - Tone, label and optional value.
 * @returns Status pill element.
 *
 * @example
 * ```tsx
 * <NeonStatusPill tone="info" label="runs" value={12} />
 * ```
 */
export function NeonStatusPill(props: NeonStatusPillProps): React.ReactElement {
    const tone = getPremiumSurfaceTokens(props.tone ?? 'forest');
    return (
        <span
            className={cx('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs', tone.border, tone.panelStrong, tone.accent)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]"/>
      <span>{props.label}</span>
            {props.value !== undefined ? <strong className={tone.text}>{props.value}</strong> : null}
    </span>
    );
}
