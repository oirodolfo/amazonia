import http from 'node:http';
import path from 'node:path';
import { WebSocketServer } from 'ws';
import { scanWorkspace } from '@/workspace';
import { PtyHost } from '@/terminal/pty-host';
import type { TerminalInputMessage, TerminalResizeMessage, TerminalSpawnRequest } from '@/shared/types';

type ClientMessage =
  | { readonly type: 'workspace:scan'; readonly rootPath: string }
  | { readonly type: 'terminal:spawn'; readonly request: TerminalSpawnRequest }
  | { readonly type: 'terminal:input'; readonly message: TerminalInputMessage }
  | { readonly type: 'terminal:resize'; readonly message: TerminalResizeMessage }
  | { readonly type: 'terminal:kill'; readonly tabId: string };

const server = http.createServer();
const socketServer = new WebSocketServer({ server });
const ptyHost = new PtyHost({
  onData: (tabId, data) => broadcast({ type: 'terminal:data', tabId, data }),
  onExit: (tabId, exitCode) => broadcast({ type: 'terminal:exit', tabId, exitCode }),
});

socketServer.on('connection', (socket) => {
  socket.on('message', async (raw) => {
    const message = JSON.parse(String(raw)) as ClientMessage;

    if (message.type === 'workspace:scan') {
      const workspace = await scanWorkspace(path.resolve(message.rootPath));
      socket.send(JSON.stringify({ type: 'workspace:changed', workspace }));
      return;
    }

    if (message.type === 'terminal:spawn') ptyHost.spawn(message.request);
    if (message.type === 'terminal:input') ptyHost.write(message.message.tabId, message.message.data);
    if (message.type === 'terminal:resize') ptyHost.resize(message.message.tabId, message.message.cols, message.message.rows);
    if (message.type === 'terminal:kill') ptyHost.kill(message.tabId);
  });
});

function broadcast(payload: unknown): void {
  const serialized = JSON.stringify(payload);
  for (const client of socketServer.clients) client.send(serialized);
}

const port = Number(process.env.AMAZONIA_WEB_SOCKET_PORT ?? 4127);
server.listen(port, () => {
  console.log(`🌳 Curupira Workbench web socket bridge running on ws://localhost:${port}`);
});
