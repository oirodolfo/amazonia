import path from 'node:path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import pty from 'node-pty';
import { registerTerminalIpc } from '@/main/ipc/register-terminal-ipc';
import { registerWorkbenchPersistenceIpc } from '@/main/ipc/register-workbench-persistence-ipc';
import { registerWorkbenchOpenersIpc } from '@/main/ipc/register-workbench-openers-ipc';
import { NodePtyTerminalManager } from '@/main/terminal/node-pty-terminal-manager';
import { openTarget } from '@/main/openers/open-target';
import { openWorkbenchDatabase } from '@/main/persistence/workbench-database';
import { createWorkbenchRepository } from '@/main/persistence/workbench-repository';
import { createMainTimelineBridge } from '@/main/timeline/main-timeline-bridge';
import type { TerminalDataFrame, TerminalSessionSnapshot } from '@/shared/runtime/runtime-types';

export interface WorkbenchBootstrapOptions {
  readonly rendererUrl?: string;
  readonly preloadPath: string;
  readonly databasePath?: string;
}

export interface WorkbenchBootstrapResult {
  readonly window: BrowserWindow;
  readonly databasePath: string;
}

/**
 * Boots the Electron workbench runtime and wires persistence, terminal IPC and openers.
 *
 * @param options - Bootstrap options for renderer, preload and database paths.
 * @returns Created window and database path.
 *
 * @example
 * ```ts
 * await bootstrapWorkbenchElectron({
 *   preloadPath: path.join(__dirname, '../preload/index.js'),
 * })
 * ```
 */
export async function bootstrapWorkbenchElectron(
  options: WorkbenchBootstrapOptions,
): Promise<WorkbenchBootstrapResult> {
  await app.whenReady();

  const databasePath = options.databasePath ?? path.join(app.getPath('userData'), 'curupira-workbench.sqlite');
  const database = openWorkbenchDatabase(databasePath);
  const repository = createWorkbenchRepository(database);
  const timeline = createMainTimelineBridge(repository);

  const window = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: '#030706',
    title: 'Curupira Workbench',
    webPreferences: {
      preload: options.preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const terminalManager = new NodePtyTerminalManager(pty, {
    onData(frame: TerminalDataFrame) {
      window.webContents.send('workbench:terminal:data', frame);
      timeline.onTerminalData(frame);
    },
    onStatus(snapshot: TerminalSessionSnapshot) {
      repository.saveTerminalSession(snapshot);
      window.webContents.send('workbench:terminal:status', snapshot);
      timeline.onTerminalStatus(snapshot);
    },
    onExit(snapshot: TerminalSessionSnapshot) {
      repository.saveTerminalSession(snapshot);
      window.webContents.send('workbench:terminal:exit', snapshot);
      timeline.onTerminalExit(snapshot);
    },
  });

  registerTerminalIpc({ ipcMain, terminalManager });
  registerWorkbenchPersistenceIpc({ ipcMain, repository });
  registerWorkbenchOpenersIpc({
    ipcMain,
    openTarget,
    openExternal: (url) => shell.openExternal(url),
  });

  if (options.rendererUrl) {
    await window.loadURL(options.rendererUrl);
  } else {
    await window.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
  }

  return {
    window,
    databasePath,
  };
}
