export type PremiumTone = 'forest' | 'terminal' | 'danger' | 'warning' | 'info' | 'violet';

export interface PremiumSurfaceTokens {
    readonly shell: string;
    readonly panel: string;
    readonly panelStrong: string;
    readonly border: string;
    readonly glow: string;
    readonly text: string;
    readonly muted: string;
    readonly accent: string;
}

export const premiumSurfaceTokens: Readonly<Record<PremiumTone, PremiumSurfaceTokens>> = {
    forest: {
        shell: 'bg-[#020605]',
        panel: 'bg-zinc-950/78',
        panelStrong: 'bg-zinc-900/88',
        border: 'border-emerald-400/15',
        glow: 'shadow-[0_0_60px_rgba(16,185,129,0.14)]',
        text: 'text-emerald-50',
        muted: 'text-zinc-500',
        accent: 'text-emerald-300'
    },
    terminal: {
        shell: 'bg-[#050807]',
        panel: 'bg-black/60',
        panelStrong: 'bg-zinc-950',
        border: 'border-teal-300/12',
        glow: 'shadow-[0_0_60px_rgba(45,212,191,0.12)]',
        text: 'text-teal-50',
        muted: 'text-zinc-500',
        accent: 'text-teal-300'
    },
    danger: {
        shell: 'bg-[#090303]',
        panel: 'bg-red-950/20',
        panelStrong: 'bg-zinc-950',
        border: 'border-red-400/20',
        glow: 'shadow-[0_0_55px_rgba(248,113,113,0.12)]',
        text: 'text-red-50',
        muted: 'text-zinc-500',
        accent: 'text-red-300'
    },
    warning: {
        shell: 'bg-[#090704]',
        panel: 'bg-amber-950/20',
        panelStrong: 'bg-zinc-950',
        border: 'border-amber-400/20',
        glow: 'shadow-[0_0_55px_rgba(251,191,36,0.11)]',
        text: 'text-amber-50',
        muted: 'text-zinc-500',
        accent: 'text-amber-300'
    },
    info: {
        shell: 'bg-[#03060a]',
        panel: 'bg-sky-950/20',
        panelStrong: 'bg-zinc-950',
        border: 'border-sky-400/20',
        glow: 'shadow-[0_0_55px_rgba(56,189,248,0.11)]',
        text: 'text-sky-50',
        muted: 'text-zinc-500',
        accent: 'text-sky-300'
    },
    violet: {
        shell: 'bg-[#07040b]',
        panel: 'bg-violet-950/20',
        panelStrong: 'bg-zinc-950',
        border: 'border-violet-400/20',
        glow: 'shadow-[0_0_55px_rgba(167,139,250,0.11)]',
        text: 'text-violet-50',
        muted: 'text-zinc-500',
        accent: 'text-violet-300'
    },
};

/**
 * Resolves premium UI tokens for a semantic tone.
 *
 * @param tone - Semantic tone.
 * @returns Tailwind class tokens for premium surfaces.
 *
 * @example
 * ```ts
 * getPremiumSurfaceTokens('forest').accent
 * ```
 */
export function getPremiumSurfaceTokens(tone: PremiumTone): PremiumSurfaceTokens {
    return premiumSurfaceTokens[tone];
}

/**
 * Joins class names while ignoring falsey values.
 *
 * @param values - Class values.
 * @returns Joined class string.
 *
 * @example
 * ```ts
 * cx('a', false && 'b', 'c')
 * ```
 */
export function cx(...values: readonly (string | false | null | undefined)[]): string {
    return values.filter(Boolean).join(' ');
}
