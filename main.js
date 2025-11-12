const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let raceWindow;  New window for index.html

function createWindow() {
  mainWindow = new BrowserWindow({
    width 1200,
    height 800,
    minWidth 1000,
    minHeight 700,
    icon path.join(__dirname, 'icon.png'),
    webPreferences {
      nodeIntegration true,
      contextIsolation false
    }
  });

  mainWindow.loadFile('login.html');
  mainWindow.setTitle('R.A.C.E 2025');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () = {
  if (process.platform !== 'darwin') app.quit();
});

 --- Open new RACE search engine window --- 
ipcMain.on('open-race-window', () = {
  if (raceWindow && !raceWindow.isDestroyed()) {
    raceWindow.focus();
    return;
  }

  raceWindow = new BrowserWindow({
    width 1300,
    height 850,
    minWidth 1100,
    minHeight 750,
    icon path.join(__dirname, 'icon.png'),
    webPreferences {
      nodeIntegration true,
      contextIsolation false
    }
  });

  raceWindow.loadFile('index.html');
  raceWindow.setTitle('R.A.C.E 2025 — Rates and Codes Engine');
});

 --- Handle Admin File Management --- 
const docsDir = path.join(__dirname, 'assets', 'docs');
const ensureDirs = () = {
  if (!fs.existsSync(path.join(__dirname, 'assets'))) fs.mkdirSync(path.join(__dirname, 'assets'));
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);
};
ensureDirs();

 Upload general files (docs, pdf, etc.) 
ipcMain.handle('select-file', async () = {
  const result = await dialog.showOpenDialog({ properties ['openFile'], filters [
    { name 'Documents', extensions ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'] }
  ]});
  if (result.canceled) return null;

  const filePath = result.filePaths[0];
  const fileName = path.basename(filePath);
  const destPath = path.join(docsDir, fileName);
  fs.copyFileSync(filePath, destPath);
  return { name fileName, time Date.now() };
});

 Upload JSON files (database  requirements) 
ipcMain.handle('upload-json', async (event, type) = {
  const file = await dialog.showOpenDialog({ properties ['openFile'], filters [
    { name 'JSON', extensions ['json'] }
  ]});
  if (file.canceled) return null;
  const filePath = file.filePaths[0];
  const fileName = type === 'database'  'database.json'  'requirements.json';
  const destPath = path.join(__dirname, fileName);
  fs.copyFileSync(filePath, destPath);
  return { name fileName, time Date.now() };
});

 List uploaded files 
ipcMain.handle('list-files', () = {
  if (!fs.existsSync(docsDir)) return [];
  return fs.readdirSync(docsDir).map(f = ({
    name f,
    time fs.statSync(path.join(docsDir, f)).mtime
  }));
});

 Rename file 
ipcMain.handle('rename-file', (event, oldName, newName) = {
  const oldPath = path.join(docsDir, oldName);
  const newPath = path.join(docsDir, newName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    return true;
  }
  return false;
});

 Delete file 
ipcMain.handle('delete-file', (event, name) = {
  const filePath = path.join(docsDir, name);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
});

 JSON file status 
ipcMain.handle('get-file-status', () = {
  const dbPath = path.join(__dirname, 'database.json');
  const reqPath = path.join(__dirname, 'requirements.json');
  return {
    database fs.existsSync(dbPath)  fs.statSync(dbPath).mtime  null,
    requirements fs.existsSync(reqPath)  fs.statSync(reqPath).mtime  null
  };
});
