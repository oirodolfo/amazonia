import {useEffect, useRef, useState} from 'react';
import {Terminal} from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import {
    createTerminalAddonController,
    type TerminalAddonController,
} from '@/renderer/terminal/addons/terminal-addon-controller';
import {TerminalAddonStatusPanel} from '@/renderer/terminal/addons/TerminalAddonStatusPanel';

export interface WarpTerminalWithAddonsProps {
    readonly onInput?: (data: string) => void;
    readonly openUrl?: (url: string) => void;
}

/**
 * Renders a standalone Warp terminal with the full xterm addon bundle.
 *
 * // REFACTOR(terminal): replace the older WarpTerminalSurface internals with this addon-backed surface once shell props are unified.
 *
 * @param props - Terminal addon shell props.
 * @returns Terminal with addon status.
 *
 * @example
 * ```tsx
 * <WarpTerminalWithAddons />
 * ```
 */
export function WarpTerminalWithAddons(
    props: WarpTerminalWithAddonsProps,
): React.ReactElement {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const controllerRef = useRef<TerminalAddonController | null>(null);
    const [results, setResults] = useState<TerminalAddonController['results']>([]);

    useEffect(() => {
        if (!hostRef.current) {
            return;
        }

        const terminal = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 13,
            lineHeight: 1.25,
            scrollback: 50000,
            theme: {
                background: '#111111',
                foreground: '#e4e4e7',
                cursor: '#34d399',
                selectionBackground: '#064e3b',
            },
        });

        const controller = createTerminalAddonController({
            terminal,
            openUrl: props.openUrl,
        });

        controllerRef.current = controller;
        setResults(controller.results);
        terminal.open(hostRef.current);
        controller.fit();
        terminal.onData((data) => props.onInput?.(data));

        const resizeObserver = new ResizeObserver(() => controller.fit());
        resizeObserver.observe(hostRef.current);

        terminal.writeln('\x1b[1;32mCurupira xterm addons ready\x1b[0m');
        terminal.writeln('fit/search/serialize/weblinks/webgl/unicode enabled when supported');

        return () => {
            resizeObserver.disconnect();
            terminal.dispose();
            controllerRef.current = null;
        };
    }, [props]);

    return (
        <div className="grid h-full grid-cols-[1fr_20rem] gap-3">
            <div className="overflow-hidden rounded-[1.75rem] border border-emerald-400/15 bg-[#111111]">
                <div ref={hostRef} className="h-full w-full p-4"/>
            </div>

            <TerminalAddonStatusPanel results={results}/>
        </div>
    );
}
