export type TerminalAddonId =
    | 'attach'
    | 'clipboard'
    | 'fit'
    | 'image'
    | 'ligatures'
    | 'progress'
    | 'search'
    | 'serialize'
    | 'unicode-graphemes'
    | 'unicode11'
    | 'web-fonts'
    | 'web-links'
    | 'webgl';

export interface TerminalAddonFeatureFlagState {
    readonly attach: boolean;
    readonly clipboard: boolean;
    readonly fit: boolean;
    readonly image: boolean;
    readonly ligatures: boolean;
    readonly progress: boolean;
    readonly search: boolean;
    readonly serialize: boolean;
    readonly unicodeGraphemes: boolean;
    readonly unicode11: boolean;
    readonly webFonts: boolean;
    readonly webLinks: boolean;
    readonly webgl: boolean;
}

export interface TerminalAddonDescriptor {
    readonly id: TerminalAddonId;
    readonly packageName: string;
    readonly enabled: boolean;
    readonly required: boolean;
    readonly description: string;
}

export interface TerminalAddonLoadResult {
    readonly id: TerminalAddonId;
    readonly status: 'loaded' | 'disabled' | 'failed';
    readonly reason: string | null;
}
