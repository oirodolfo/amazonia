import {useMemo, useRef, useState} from 'react';
import type {Terminal} from '@xterm/xterm';
import {createTerminalAddonController, type TerminalAddonController,} from './terminal-addon-controller';
import type {
    TerminalAddonFeatureFlagState,
    TerminalAddonLoadResult,
} from '@/shared/terminal/addons/terminal-addon-types';

export interface UseXTermAddonControllerInput {
    readonly flags?: Partial<TerminalAddonFeatureFlagState>;
    readonly webSocket?: WebSocket | null;
    readonly openUrl?: (url: string) => void;
}

export interface UseXTermAddonControllerResult {
    readonly controller: TerminalAddonController | null;
    readonly results: readonly TerminalAddonLoadResult[];
    readonly createController: (terminal: Terminal) => TerminalAddonController;
}

/**
 * Creates a React-friendly xterm addon controller factory.
 *
 * // REFACTOR(terminal): once every terminal shell uses useXTerm, this hook should become the only addon entrypoint.
 *
 * @param input - Addon feature flags and integrations.
 * @returns Addon controller factory and load results.
 *
 * @example
 * ```tsx
 * const addons = useXTermAddonController({ openUrl });
 * ```
 */
export function useXTermAddonController(
    input: UseXTermAddonControllerInput = {},
): UseXTermAddonControllerResult {
    const controllerRef = useRef<TerminalAddonController | null>(null);
    const [results, setResults] = useState<readonly TerminalAddonLoadResult[]>([]);

    const createController = useMemo(
        () => (terminal: Terminal) => {
            const controller = createTerminalAddonController({
                terminal,
                flags: input.flags,
                webSocket: input.webSocket,
                openUrl: input.openUrl,
            });

            controllerRef.current = controller;
            setResults(controller.results);

            return controller;
        },
        [input.flags, input.openUrl, input.webSocket],
    );

    return {
        controller: controllerRef.current,
        results,
        createController,
    };
}
