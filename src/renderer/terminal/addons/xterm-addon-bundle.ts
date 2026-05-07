import {AttachAddon} from '@xterm/addon-attach';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {ImageAddon} from '@xterm/addon-image';
import {LigaturesAddon} from '@xterm/addon-ligatures';
import {ProgressAddon} from '@xterm/addon-progress';
import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {UnicodeGraphemesAddon} from '@xterm/addon-unicode-graphemes';
import {Unicode11Addon} from '@xterm/addon-unicode11';
import {WebFontsAddon} from '@xterm/addon-web-fonts';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import type {ITerminalAddon, Terminal} from '@xterm/xterm';
import type {
    TerminalAddonDescriptor,
    TerminalAddonId,
    TerminalAddonLoadResult,
} from '@/shared/terminal/addons/terminal-addon-types';

export interface XtermAddonBundle {
    readonly attach: AttachAddon | null;
    readonly clipboard: ClipboardAddon | null;
    readonly fit: FitAddon | null;
    readonly image: ImageAddon | null;
    readonly ligatures: LigaturesAddon | null;
    readonly progress: ProgressAddon | null;
    readonly search: SearchAddon | null;
    readonly serialize: SerializeAddon | null;
    readonly unicodeGraphemes: UnicodeGraphemesAddon | null;
    readonly unicode11: Unicode11Addon | null;
    readonly webFonts: WebFontsAddon | null;
    readonly webLinks: WebLinksAddon | null;
    readonly webgl: WebglAddon | null;
    readonly results: readonly TerminalAddonLoadResult[];
}

export interface CreateXtermAddonBundleOptions {
    readonly descriptors: readonly TerminalAddonDescriptor[];
    readonly terminal: Terminal;
    readonly webSocket?: WebSocket | null;
    readonly openUrl?: (url: string) => void;
}

/**
 * Creates and loads the xterm addon bundle.
 *
 * @param options - Terminal, descriptors and optional integrations.
 * @returns Loaded addon bundle.
 *
 * @example
 * ```tsx
 * const bundle = createXtermAddonBundle({ terminal, descriptors })
 * bundle.fit?.fit()
 * ```
 */
export function createXtermAddonBundle(
    options: CreateXtermAddonBundleOptions,
): XtermAddonBundle {
    const results: TerminalAddonLoadResult[] = [];
    const bundle: MutableXtermAddonBundle = {
        attach: null,
        clipboard: null,
        fit: null,
        image: null,
        ligatures: null,
        progress: null,
        search: null,
        serialize: null,
        unicodeGraphemes: null,
        unicode11: null,
        webFonts: null,
        webLinks: null,
        webgl: null,
    };

    for (const descriptor of options.descriptors) {
        if (!descriptor.enabled) {
            results.push({
                id: descriptor.id,
                status: 'disabled',
                reason: 'Feature flag disabled.',
            });
            continue;
        }

        try {
            const addon = createAddon(descriptor.id, options);

            if (!addon) {
                results.push({
                    id: descriptor.id,
                    status: 'disabled',
                    reason: 'Addon requires unavailable runtime integration.',
                });
                continue;
            }

            options.terminal.loadAddon(addon);
            assignAddon(bundle, descriptor.id, addon);
            results.push({
                id: descriptor.id,
                status: 'loaded',
                reason: null,
            });
        } catch (error) {
            results.push({
                id: descriptor.id,
                status: descriptor.required ? 'failed' : 'disabled',
                reason: error instanceof Error ? error.message : 'Unknown addon error.',
            });
        }
    }

    return {
        ...bundle,
        results,
    };
}

type MutableXtermAddonBundle = Omit<XtermAddonBundle, 'results'>;

function createAddon(
    id: TerminalAddonId,
    options: CreateXtermAddonBundleOptions,
): ITerminalAddon | null {
    switch (id) {
        case 'attach':
            if (!options.webSocket) {
                // TODO(addons): wire AttachAddon in web mode once the terminal WebSocket is provided by the runtime shell.
                return null;
            }
            return new AttachAddon(options.webSocket);
        case 'clipboard':
            return new ClipboardAddon();
        case 'fit':
            return new FitAddon();
        case 'image':
            return new ImageAddon();
        case 'ligatures':
            return new LigaturesAddon();
        case 'progress':
            return new ProgressAddon();
        case 'search':
            return new SearchAddon();
        case 'serialize':
            return new SerializeAddon();
        case 'unicode-graphemes':
            return new UnicodeGraphemesAddon();
        case 'unicode11':
            return new Unicode11Addon();
        case 'web-fonts':
            return new WebFontsAddon();
        case 'web-links':
            return new WebLinksAddon(options.openUrl);
        case 'webgl':
            return new WebglAddon();
    }
}

function assignAddon(
    bundle: MutableXtermAddonBundle,
    id: TerminalAddonId,
    addon: ITerminalAddon,
): void {
    switch (id) {
        case 'attach':
            bundle.attach = addon as AttachAddon;
            break;
        case 'clipboard':
            bundle.clipboard = addon as ClipboardAddon;
            break;
        case 'fit':
            bundle.fit = addon as FitAddon;
            break;
        case 'image':
            bundle.image = addon as ImageAddon;
            break;
        case 'ligatures':
            bundle.ligatures = addon as LigaturesAddon;
            break;
        case 'progress':
            bundle.progress = addon as ProgressAddon;
            break;
        case 'search':
            bundle.search = addon as SearchAddon;
            break;
        case 'serialize':
            bundle.serialize = addon as SerializeAddon;
            break;
        case 'unicode-graphemes':
            bundle.unicodeGraphemes = addon as UnicodeGraphemesAddon;
            break;
        case 'unicode11':
            bundle.unicode11 = addon as Unicode11Addon;
            break;
        case 'web-fonts':
            bundle.webFonts = addon as WebFontsAddon;
            break;
        case 'web-links':
            bundle.webLinks = addon as WebLinksAddon;
            break;
        case 'webgl':
            bundle.webgl = addon as WebglAddon;
            break;
    }
}
