import {useEffect, useMemo, useRef} from 'react';
import {FitAddon} from '@xterm/addon-fit';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {Terminal} from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import type {TerminalStreamFrame} from '@/shared/terminal/terminal-stream-model';
import {FoldableTerminalSections} from '@/renderer/output/FoldableTerminalSections';

export interface RealTerminalSurfaceProps {
    readonly sessionId: string;
    readonly frames: readonly TerminalStreamFrame[];
    readonly onInput: (sessionId: string, data: string) => void;
    readonly onResize: (sessionId: string, cols: number, rows: number) => void;
}

/**
 * Renders the real terminal surface with xterm and the structured output rail.
 *
 * @param props - Session id, frames and terminal callbacks.
 * @returns Terminal surface element.
 *
 * @example
 * ```tsx
 * <RealTerminalSurface sessionId="term" frames={frames} onInput={write} onResize={resize} />
 * ```
 */
export function RealTerminalSurface(props: RealTerminalSurfaceProps): React.ReactElement {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const writtenFrameCountRef = useRef(0);

    useEffect(() => {
        if (!hostRef.current) {
            return;
        }

        const terminal = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            scrollback: 10000,
            theme: {
                background: '#020605',
                foreground: '#d6ffe8',
                cursor: '#5eead4',
                selectionBackground: '#064e3b',
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

        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
            props.onResize(props.sessionId, terminal.cols, terminal.rows);
        });
        resizeObserver.observe(hostRef.current);

        return () => {
            resizeObserver.disconnect();
            terminal.dispose();
            terminalRef.current = null;
            writtenFrameCountRef.current = 0;
        };
    }, [props.sessionId]);

    useEffect(() => {
        const terminal = terminalRef.current;
        if (!terminal) {
            return;
        }

        for (const frame of props.frames.slice(writtenFrameCountRef.current)) {
            terminal.write(frame.raw);
        }

        writtenFrameCountRef.current = props.frames.length;
    }, [props.frames]);

    const lines = useMemo(
        () => props.frames.flatMap((frame) => frame.lines),
        [props.frames],
    );

    return (
        <div className="grid h-full grid-cols-[1fr_24rem] gap-3">
            <div
                className="overflow-hidden rounded-[1.5rem] border border-emerald-400/10 bg-[#020605] shadow-[0_0_60px_rgba(16,185,129,0.12)]">
                <div ref={hostRef} className="h-full w-full p-3"/>
            </div>

            <div className="min-h-0 overflow-auto">
                <FoldableTerminalSections lines={lines}/>
            </div>
        </div>
    );
}
