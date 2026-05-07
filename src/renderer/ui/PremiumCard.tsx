import {cx, getPremiumSurfaceTokens, type PremiumTone} from '@/shared/ui/premium-theme';

export interface PremiumCardProps {
    readonly tone?: PremiumTone;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly children: React.ReactNode;
    readonly className?: string;
}

/**
 * Renders a premium glassy card used across dashboard panels.
 *
 * @param props - Card content and tone.
 * @returns Premium card element.
 *
 * @example
 * ```tsx
 * <PremiumCard tone="forest" title="Timeline">...</PremiumCard>
 * ```
 */
export function PremiumCard(props: PremiumCardProps): React.Element {
    const tone = getPremiumSurfaceTokens(props.tone ?? 'forest');
    return (
        <section
            className={cx('rounded-[1.75rem] border p-4 backdrop-blur-xl transition duration-300', tone.panel, tone.border, tone.glow, props.className)}>
            {props.eyebrow || props.title ? (
                <header className="mb-4">
                    {props.eyebrow ?
                        <p className={cx('text-xs uppercase tracking-[0.28em]', tone.accent)}>{props.eyebrow}</p> : null}
                    {props.title ?
                        <h2 className={cx('mt-1 text-lg font-semibold', tone.text)}>{props.title}</h2> : null}
                </header>
            ) : null}
            {props.children}
        </section>
    );
}
