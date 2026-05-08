import path from 'node:path';
import {createRequire} from 'node:module';
import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron';
import {scanWorkspace} from '@/workspace';
import {PtyHost} from '@/terminal/pty-host';
import type {
    LayoutState,
    RunRecord,
    TerminalInputMessage,
    TerminalResizeMessage,
    TerminalSpawnRequest
} from '@/shared/types';
import {createFallbackWorkbenchDatabase} from '@/main/persistence/workbench-database-fallback';

type WorkbenchDatabaseLike = {
    readLayout(): LayoutState;
    writeLayout(layout: LayoutState): void;
    recordRun(run: RunRecord): void;
    incrementActionWeight(actionId: string): void;
    readActionWeights(): Readonly<Record<string, number>>;
};

const databasePath = path.join(app.getPath('userData'), 'curupira-workbench.sqlite');
const database: WorkbenchDatabaseLike = await openWorkbenchDatabaseOrFallback(databasePath);
let mainWindow: BrowserWindow | null = null;

const ptyHost = new PtyHost({
    onData: (tabId, data) => mainWindow?.webContents.send('workbench:event', {type: 'terminal:data', tabId, data}),
    onExit: (tabId, exitCode) => mainWindow?.webContents.send('workbench:event', {
        type: 'terminal:exit',
        tabId,
        exitCode
    }),
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
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});

ipcMain.handle('workspace:open', async () => {
    const result = await dialog.showOpenDialog({properties: ['openDirectory']});
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
ipcMain.handle('runs:record', (_event, run: RunRecord) => {
    database.recordRun(run);
    database.incrementActionWeight(run.actionId);
});
ipcMain.handle('native:openExternal', (_event, target: string) => shell.openExternal(target));
ipcMain.handle('native:openPath', (_event, target: string) => shell.openPath(target));

async function openWorkbenchDatabaseOrFallback(dbPath: string): Promise<WorkbenchDatabaseLike> {
    const require = createRequire(import.meta.url);
    try {
        // Ensure native module can be loaded under Electron's Node ABI.
        require('better-sqlite3');
        const module = await import('@/persistence/database');
        return module.createWorkbenchDatabase(dbPath);
    } catch (error) {
        // TODO(persistence): Replace fallback with a native-free SQLite driver, or document required build tools for better-sqlite3.
        console.warn('[workbench] SQLite native module unavailable; using in-memory fallback.', error);
        return createFallbackWorkbenchDatabase();
    }
}
