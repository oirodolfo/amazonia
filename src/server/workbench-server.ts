import pty from 'node-pty';
import { NodePtyTerminalManager } from '@/main/terminal/node-pty-terminal-manager';
import { openWorkbenchDatabase } from '@/main/persistence/workbench-database';
import { createWorkbenchRepository } from '@/main/persistence/workbench-repository';
import { startWorkbenchTerminalServer } from './workbench-terminal-server';

const PORT = Number(process.env.AMAZONIA_WORKBENCH_PORT ?? 17333);
const DATABASE_PATH = process.env.AMAZONIA_WORKBENCH_DB ?? './.amazonia/workbench.sqlite';

const database = openWorkbenchDatabase(DATABASE_PATH);
const repository = createWorkbenchRepository(database);

const terminalManager = new NodePtyTerminalManager(pty, {
  onData(frame) {
    console.log('[terminal:data]', frame.sessionId, frame.data.length);
  },
  onStatus(snapshot) {
    repository.saveTerminalSession(snapshot);
    console.log('[terminal:status]', snapshot.id, snapshot.status);
  },
  onExit(snapshot) {
    repository.saveTerminalSession(snapshot);
    console.log('[terminal:exit]', snapshot.id, snapshot.exitCode);
  },
});

startWorkbenchTerminalServer({
  port: PORT,
  terminalManager,
});

console.log(`[amazonia] Workbench terminal server listening on ws://localhost:${PORT}`);
