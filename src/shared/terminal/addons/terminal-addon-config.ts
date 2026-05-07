import type {TerminalAddonDescriptor, TerminalAddonFeatureFlagState,} from './terminal-addon-types';

export const defaultTerminalAddonFeatureFlags: TerminalAddonFeatureFlagState = {
    attach: true,
    clipboard: true,
    fit: true,
    image: true,
    ligatures: true,
    progress: true,
    search: true,
    serialize: true,
    unicodeGraphemes: true,
    unicode11: true,
    webFonts: true,
    webLinks: true,
    webgl: true,
};

/**
 * Creates terminal addon descriptors from feature flags.
 *
 * @param flags - Terminal addon feature flags.
 * @returns Terminal addon descriptors.
 *
 * @example
 * ```ts
 * createTerminalAddonDescriptors(defaultTerminalAddonFeatureFlags)
 * ```
 */
export function createTerminalAddonDescriptors(
    flags: TerminalAddonFeatureFlagState,
): TerminalAddonDescriptor[] {
    return [
        {
            id: 'attach',
            packageName: '@xterm/addon-attach',
            enabled: flags.attach,
            required: false,
            description: 'Connects xterm to WebSocket streams for web mode.',
        },
        {
            id: 'clipboard',
            packageName: '@xterm/addon-clipboard',
            enabled: flags.clipboard,
            required: false,
            description: 'Improves copy/paste ergonomics.',
        },
        {
            id: 'fit',
            packageName: '@xterm/addon-fit',
            enabled: flags.fit,
            required: true,
            description: 'Fits terminal dimensions to its container.',
        },
        {
            id: 'image',
            packageName: '@xterm/addon-image',
            enabled: flags.image,
            required: false,
            description: 'Supports inline terminal images when available.',
        },
        {
            id: 'ligatures',
            packageName: '@xterm/addon-ligatures',
            enabled: flags.ligatures,
            required: false,
            description: 'Enables programming font ligatures.',
        },
        {
            id: 'progress',
            packageName: '@xterm/addon-progress',
            enabled: flags.progress,
            required: false,
            description: 'Parses terminal progress markers.',
        },
        {
            id: 'search',
            packageName: '@xterm/addon-search',
            enabled: flags.search,
            required: true,
            description: 'Adds search/highlight support.',
        },
        {
            id: 'serialize',
            packageName: '@xterm/addon-serialize',
            enabled: flags.serialize,
            required: true,
            description: 'Serializes scrollback for restore/replay.',
        },
        {
            id: 'unicode-graphemes',
            packageName: '@xterm/addon-unicode-graphemes',
            enabled: flags.unicodeGraphemes,
            required: false,
            description: 'Improves grapheme cluster width handling.',
        },
        {
            id: 'unicode11',
            packageName: '@xterm/addon-unicode11',
            enabled: flags.unicode11,
            required: false,
            description: 'Improves Unicode 11 width support.',
        },
        {
            id: 'web-fonts',
            packageName: '@xterm/addon-web-fonts',
            enabled: flags.webFonts,
            required: false,
            description: 'Loads web fonts for terminal rendering.',
        },
        {
            id: 'web-links',
            packageName: '@xterm/addon-web-links',
            enabled: flags.webLinks,
            required: true,
            description: 'Makes URLs clickable.',
        },
        {
            id: 'webgl',
            packageName: '@xterm/addon-webgl',
            enabled: flags.webgl,
            required: false,
            description: 'Enables GPU accelerated renderer where supported.',
        },
    ];
}
