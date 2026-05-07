import { useEffect, useMemo, useRef, useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

export interface WarpTerminalBlock {
  readonly id: string;
  readonly command: string;
  readonly duration: string;
  readonly status: 'success' | 'error' | 'running';
  readonly output: string;
}

export interface WarpTerminalSurfaceProps {
  readonly blocks: readonly WarpTerminalBlock[];
  readonly onCommand?: (command: string) => void;
}

/**
 * Premium Warp-inspired terminal surface.
 */
export function WarpTerminalSurface(props: WarpTerminalSurfaceProps): JSX.Element {
  const terminalHostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!terminalHostRef.current) {
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
        green: '#4ade80',
        red: '#fb7185',
        yellow: '#facc15',
        cyan: '#22d3ee',
      },
    });

    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    terminal.open(terminalHostRef.current);
    fitAddon.fit();

    terminal.writeln('\x1b[1;32mCurupira Workbench Terminal Ready\x1b[0m');
    terminal.writeln('');

    terminalRef.current = terminal;

    return () => {
      terminal.dispose();
    };
  }, []);

  const groupedBlocks = useMemo(() => props.blocks.slice(-30), [props.blocks]);

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
    <div className="grid h-full grid-cols-[1fr_420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] shadow-[0_0_120px_rgba(16,185,129,0.18)]">
      <section className="flex min-h-0 flex-col overflow-hidden border-r border-white/5">
        <header className="flex items-center justify-between border-b border-white/5 bg-[#18181b] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#fb7185]" />
              <span className="h-3 w-3 rounded-full bg-[#facc15]" />
              <span className="h-3 w-3 rounded-full bg-[#4ade80]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Curupira Terminal
              </h2>

              <p className="text-[11px] text-zinc-500">
                semantic runtime stream
              </p>
            </div>
          </div>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            PTY LIVE
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div ref={terminalHostRef} className="h-full w-full p-4" />
        </div>

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

      <aside className="flex min-h-0 flex-col overflow-hidden bg-[#141414]">
        <header className="border-b border-white/5 px-5 py-4">
          <h3 className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Command Blocks
          </h3>
        </header>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {groupedBlocks.map((block) => (
              <article
                key={block.id}
                className="overflow-hidden rounded-3xl border border-white/5 bg-[#1a1a1a] shadow-[0_0_40px_rgba(0,0,0,0.35)]"
              >
                <header className="border-b border-white/5 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <code className="truncate font-mono text-xs font-semibold text-zinc-100">
                      {block.command}
                    </code>

                    <span
                      className={
                        block.status === 'success'
                          ? 'rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300'
                          : block.status === 'error'
                            ? 'rounded-full bg-red-400/10 px-2 py-1 text-[10px] text-red-300'
                            : 'rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-300'
                      }
                    >
                      {block.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    {block.duration}
                  </div>
                </header>

                <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-4 font-mono text-[12px] leading-6 text-zinc-300">
                  {block.output}
                </pre>
              </article>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
