import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import * as React from 'react';
import type { TerminalTab } from '@/shared';
import { bridge } from '@/renderer/bridge';
import { t } from '@/renderer/i18n/messages';

interface TerminalPaneProps {
  readonly activeTab: TerminalTab | null;
}

export function TerminalPane({ activeTab }: TerminalPaneProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const terminalRef = React.useRef<Terminal | null>(null);
  const fitRef = React.useRef<FitAddon | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (container === null || activeTab === null) return;

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 13,
      theme: { background: '#05070a', foreground: '#d4d4d8', cursor: '#34d399', selectionBackground: '#064e3b' },
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.loadAddon(new WebLinksAddon((event, uri) => {
      event.preventDefault();
      void bridge.openExternal?.(uri);
    }));
    terminal.open(container);
    fit.fit();
    terminal.focus();
    terminal.onData((data) => void bridge.writeTerminal({ tabId: activeTab.id, data }));

    terminalRef.current = terminal;
    fitRef.current = fit;
    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
      void bridge.resizeTerminal({ tabId: activeTab.id, cols: terminal.cols, rows: terminal.rows });
    });
    resizeObserver.observe(container);

    const off = bridge.onEvent((event) => {
      if (event.type === 'terminal:data' && event.tabId === activeTab.id) terminal.write(event.data);
      if (event.type === 'terminal:exit' && event.tabId === activeTab.id) terminal.write(`\r\n\x1b[32mProcess exited with code ${event.exitCode}\x1b[0m\r\n`);
    });

    return () => {
      off();
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [activeTab]);

  if (activeTab === null) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-500">{t('terminal.emptyTitle')}</div>;
  }

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#05070a] p-2 shadow-inner shadow-emerald-950/20" />;
}
