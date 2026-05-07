import path from 'node:path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { scanWorkspace } from '@/workspace';
import { PtyHost } from '@/terminal/pty-host';
import { createWorkbenchDatabase } from '@/persistence/database';
import type { LayoutState, RunRecord, TerminalInputMessage, TerminalResizeMessage, TerminalSpawnRequest } from '@/shared/types';

const database = createWorkbenchDatabase(path.join(app.getPath('userData'), 'curupira-workbench.sqlite'));
let mainWindow: BrowserWindow | null = null;

const ptyHost = new PtyHost({
  onData: (tabId, data) => mainWindow?.webContents.send('workbench:event', { type: 'terminal:data', tabId, data }),
  onExit: (tabId, exitCode) => mainWindow?.webContents.send('workbench:event', { type: 'terminal:exit', tabId, exitCode }),
});

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#05070a',
    title: 'Curupira Workbench',
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist-electron/preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL !== undefined) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });

ipcMain.handle('workspace:open', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || result.filePaths[0] === undefined) return null;
  return scanWorkspace(result.filePaths[0]);
});
ipcMain.handle('workspace:scan', (_event, rootPath: string) => scanWorkspace(rootPath));
ipcMain.handle('terminal:spawn', (_event, request: TerminalSpawnRequest) => ptyHost.spawn(request));
ipcMain.handle('terminal:write', (_event, message: TerminalInputMessage) => ptyHost.write(message.tabId, message.data));
ipcMain.handle('terminal:resize', (_event, message: TerminalResizeMessage) => ptyHost.resize(message.tabId, message.cols, message.rows));
ipcMain.handle('terminal:kill', (_event, tabId: string) => ptyHost.kill(tabId));
ipcMain.handle('layout:read', () => database.readLayout());
ipcMain.handle('layout:write', (_event, layout: LayoutState) => database.writeLayout(layout));
ipcMain.handle('runs:record', (_event, run: RunRecord) => { database.recordRun(run); database.incrementActionWeight(run.actionId); });
ipcMain.handle('native:openExternal', (_event, target: string) => shell.openExternal(target));
ipcMain.handle('native:openPath', (_event, target: string) => shell.openPath(target));
