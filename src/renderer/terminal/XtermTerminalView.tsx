import {FitAddon} from '@xterm/addon-fit';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {Terminal} from '@xterm/xterm';
import {useEffect, useRef} from 'react';
import '@xterm/xterm/css/xterm.css';

export interface XtermTerminalViewProps {
    readonly sessionId: string;
    readonly onInput: (sessionId: string, data: string) => void;
    readonly onResize: (sessionId: string, cols: number, rows: number) => void;
}

/**
 * Renders an xterm instance connected to the workbench terminal protocol.
 *
 * @param props - Session id and bridge callbacks.
 * @returns Terminal host element.
 *
 * @example
 * ```tsx
 * <XtermTerminalView sessionId={session.id} onInput={write} onResize={resize} />
 * ```
 */
export function XtermTerminalView(props: XtermTerminalViewProps): React.ReactElement {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const terminalRef = useRef<Terminal | null>(null);

    useEffect(() => {
        if (!hostRef.current) {
            return;
        }

        const terminal = new Terminal({
            cursorBlink: true,
            fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            theme: {
                background: '#050807',
                foreground: '#d6ffe8',
                cursor: '#5eead4',
                selectionBackground: '#14532d',
            },
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(new WebLinksAddon());
        terminal.open(hostRef.current);
        fitAddon.fit();

        terminal.onData((data) => props.onInput(props.sessionId, data));
        terminal.onResize((size) => props.onResize(props.sessionId, size.cols, size.rows));

        terminalRef.current = terminal;

        return () => {
            terminal.dispose();
            terminalRef.current = null;
        };
    }, [props.sessionId]);

    return <div className="h-full w-full overflow-hidden rounded-2xl bg-[#050807]" ref={hostRef}/>;
}
