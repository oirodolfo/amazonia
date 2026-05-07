import {useCallback, useRef, useState} from 'react';
import type {Terminal} from '@xterm/xterm';
import {useXTerm} from './use-xterm';
import {useXTermAddonController} from './addons/use-xterm-addon-controller';
import {TerminalAddonStatusPanel} from './addons/TerminalAddonStatusPanel';

export interface WarpTerminalWithHookProps {
    readonly onInput?: (data: string) => void;
    readonly onCommand?: (command: string) => void;
    readonly openUrl?: (url: string) => void;
}

/**
 * Warp-style terminal shell powered by the reusable useXTerm hook.
 *
 * // TODO(terminal-wiring): replace remaining xterm construction sites with this hook-backed shell.
 *
 * @param props - Terminal callbacks.
 * @returns Hook-backed Warp terminal.
 *
 * @example
 * ```tsx
 * <WarpTerminalWithHook onInput={writeToPty} />
 * ```
 */
export function WarpTerminalWithHook(props: WarpTerminalWithHookProps): React.Element {
    const [draft, setDraft] = useState('');
    const terminalRef = useRef<Terminal | null>(null);
    const addonController = useXTermAddonController({
        openUrl: props.openUrl,
    });

    const handleReady = useCallback((terminal: Terminal) => {
        terminalRef.current = terminal;
        addonController.createController(terminal);
        terminal.writeln('\x1b[1;32mCurupira Workbench Terminal Ready\x1b[0m');
        terminal.writeln('');
    }, [addonController]);

    const {ref} = useXTerm({
        listeners: {
            onData: props.onInput,
            onResize: () => addonController.controller?.fit(),
        },
        onTerminalReady: handleReady,
        onTerminalDisposed: () => {
            terminalRef.current = null;
        },
    });

    const submit = (): void => {
        const command = draft.trim();

        if (!command) {
            return;
        }

        terminalRef.current?.writeln(`\r\n\x1b[1;36m❯ ${command}\x1b[0m`);
        props.onCommand?.(command);
        setDraft('');
    };

    return (
        <div className="grid h-full grid-cols-[1fr_20rem] gap-3">
            <section
                className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-emerald-400/15 bg-[#111111]">
                <div ref={ref} className="min-h-0 flex-1 p-4"/>

                <footer className="border-t border-white/5 bg-[#18181b] p-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                        <span className="text-sm text-emerald-300">❯</span>

                        <input
                            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                            placeholder="Run workspace command..."
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    submit();
                                }
                            }}
                        />

                        <button
                            type="button"
                            className="rounded-xl bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
                            onClick={submit}
                        >
                            Run
                        </button>
                    </div>
                </footer>
            </section>

            <TerminalAddonStatusPanel results={addonController.results}/>
        </div>
    );
}
