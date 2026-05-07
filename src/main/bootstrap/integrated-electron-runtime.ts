import path from 'node:path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import pty from 'node-pty';
import { NodePtyTerminalManager } from '@/main/terminal/node-pty-terminal-manager';
import { registerTerminalIpc } from '@/main/ipc/register-terminal-ipc';
import { registerWorkbenchOpenersIpc } from '@/main/ipc/register-workbench-openers-ipc';
import { registerWorkbenchPersistenceIpc } from '@/main/ipc/register-workbench-persistence-ipc';
import { openTarget } from '@/main/openers/open-target';
import { openWorkbenchDatabase } from '@/main/persistence/workbench-database';
import { createWorkbenchRepository } from '@/main/persistence/workbench-repository';
import { openRuntimeSQLiteDatabase } from '@/main/persistence/runtime-sqlite-database';
import { createRuntimeSQLiteRepository } from '@/main/persistence/runtime-sqlite-repository';
import { createIntegratedRuntimeStore } from '@/shared/runtime/integrated-runtime-store';
import type { TerminalDataFrame, TerminalSessionSnapshot } from '@/shared/runtime/runtime-types';

export interface IntegratedElectronRuntimeOptions {
  readonly preloadPath: string;
  readonly rendererUrl?: string;
  readonly workbenchDatabasePath?: string;
  readonly runtimeDatabasePath?: string;
}

export interface IntegratedElectronRuntimeResult {
  readonly window: BrowserWindow;
  readonly workbenchDatabasePath: string;
  readonly runtimeDatabasePath: string;
}

/**
 * Boots the fully wired Electron runtime: SQLite, terminal, IPC, runtime store and renderer events.
 *
 * @param options - Electron runtime options.
 * @returns Boot result.
 *
 * @example
 * ```ts
 * await bootstrapIntegratedElectronRuntime({ preloadPath })
 * ```
 */
export async function bootstrapIntegratedElectronRuntime(
  options: IntegratedElectronRuntimeOptions,
): Promise<IntegratedElectronRuntimeResult> {
  await app.whenReady();

  const workbenchDatabasePath = options.workbenchDatabasePath
    ?? path.join(app.getPath('userData'), 'curupira-workbench.sqlite');
  const runtimeDatabasePath = options.runtimeDatabasePath
    ?? path.join(app.getPath('userData'), 'curupira-runtime.sqlite');

  const workbenchDatabase = openWorkbenchDatabase(workbenchDatabasePath);
  const workbenchRepository = createWorkbenchRepository(workbenchDatabase);
  const runtimeDatabase = openRuntimeSQLiteDatabase(runtimeDatabasePath);
  const runtimeRepository = createRuntimeSQLiteRepository(runtimeDatabase);
  const runtimeStore = createIntegratedRuntimeStore(runtimeRepository);

  const window = new BrowserWindow({
    width: 1560,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#020605',
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
      runtimeStore.publishTerminalData({
        sessionId: frame.sessionId,
        data: frame.data,
        receivedAt: frame.receivedAt,
      });

      window.webContents.send('workbench:terminal:data', frame);
      window.webContents.send('workbench:runtime:state', runtimeStore.state);
    },

    onStatus(snapshot: TerminalSessionSnapshot) {
      workbenchRepository.saveTerminalSession(snapshot);
      runtimeRepository.saveRun({
        id: snapshot.id,
        command: snapshot.command ?? '',
        cwd: snapshot.cwd,
        status: snapshot.status === 'created' || snapshot.status === 'connecting'
          ? 'created'
          : snapshot.status === 'idle'
            ? 'created'
            : snapshot.status,
        startedAt: snapshot.createdAt,
        finishedAt: snapshot.status === 'exited' ? snapshot.updatedAt : null,
        exitCode: snapshot.exitCode,
      });

      window.webContents.send('workbench:terminal:status', snapshot);
      window.webContents.send('workbench:runtime:state', runtimeStore.state);
    },

    onExit(snapshot: TerminalSessionSnapshot) {
      workbenchRepository.saveTerminalSession(snapshot);
      runtimeRepository.saveRun({
        id: snapshot.id,
        command: snapshot.command ?? '',
        cwd: snapshot.cwd,
        status: 'exited',
        startedAt: snapshot.createdAt,
        finishedAt: snapshot.updatedAt,
        exitCode: snapshot.exitCode,
      });

      window.webContents.send('workbench:terminal:exit', snapshot);
      window.webContents.send('workbench:runtime:state', runtimeStore.state);
    },
  });

  registerTerminalIpc({ ipcMain, terminalManager });
  registerWorkbenchPersistenceIpc({ ipcMain, repository: workbenchRepository });
  registerWorkbenchOpenersIpc({
    ipcMain,
    openTarget,
    openExternal: (url) => shell.openExternal(url),
  });

  ipcMain.handle('workbench:runtime:get-state', () => runtimeStore.state);
  ipcMain.handle('workbench:runtime:clear', () => {
    runtimeStore.clear();
    window.webContents.send('workbench:runtime:state', runtimeStore.state);
    return true;
  });

  if (options.rendererUrl) {
    await window.loadURL(options.rendererUrl);
  } else {
    await window.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
  }

  return {
    window,
    workbenchDatabasePath,
    runtimeDatabasePath,
  };
}
