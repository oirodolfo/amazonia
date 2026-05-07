import type {Terminal} from '@xterm/xterm';
import {
    createTerminalAddonDescriptors,
    defaultTerminalAddonFeatureFlags,
} from '@/shared/terminal/addons/terminal-addon-config';
import type {
    TerminalAddonFeatureFlagState,
    TerminalAddonLoadResult,
} from '@/shared/terminal/addons/terminal-addon-types';
import {createXtermAddonBundle, type XtermAddonBundle,} from './xterm-addon-bundle';

export interface TerminalAddonController {
    readonly bundle: XtermAddonBundle;
    readonly results: readonly TerminalAddonLoadResult[];

    fit(): void;

    serialize(): string;

    search(query: string): boolean;
}

/**
 * Creates the terminal addon controller used by WarpTerminalSurface.
 *
 * @param input - Terminal and addon integration input.
 * @returns Terminal addon controller.
 *
 * @example
 * ```ts
 * const controller = createTerminalAddonController({ terminal })
 * controller.fit()
 * ```
 */
export function createTerminalAddonController(input: {
    readonly terminal: Terminal;
    readonly flags?: Partial<TerminalAddonFeatureFlagState>;
    readonly webSocket?: WebSocket | null;
    readonly openUrl?: (url: string) => void;
}): TerminalAddonController {
    const flags = {
        ...defaultTerminalAddonFeatureFlags,
        ...input.flags,
    };

    const descriptors = createTerminalAddonDescriptors(flags);
    const bundle = createXtermAddonBundle({
        descriptors,
        terminal: input.terminal,
        webSocket: input.webSocket,
        openUrl: input.openUrl,
    });

    return {
        bundle,
        results: bundle.results,
        fit() {
            bundle.fit?.fit();
        },
        serialize() {
            return bundle.serialize?.serialize() ?? '';
        },
        search(query) {
            if (!query.trim()) {
                return false;
            }

            return bundle.search?.findNext(query) ?? false;
        },
    };
}
