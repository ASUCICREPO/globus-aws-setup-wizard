
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 750,
    height: 630,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      icon: path.join(__dirname, 'icon1.icns') // Path to your ICO file
    }
  });

  win.loadFile('index.html');

  win.webContents.setWindowOpenHandler(({ url }) => {
    handleUrl(url);
    return { action: 'deny' };
  });
}

async function handleUrl(url) {
  const parsedUrl = maybeParseUrl(url);
  if (!parsedUrl) {
    return;
  }

  const { protocol } = parsedUrl;
  // We could handle all possible link cases here, not only http/https
  if (protocol === 'http:' || protocol === 'https:') {
    try {
      await shell.openExternal(url);
    } catch (error) {
      console.log(`Failed to open url: ${error}`);
    }
  }
}

function maybeParseUrl(value) {
  if (typeof value === 'string') {
    try {
      return new URL(value);
    } catch (err) {
      // Errors are ignored, as we only want to check if the value is a valid url
      console.log(`Failed to parse url: ${value}`);
    }
  }

  return undefined;
}

// Handle IPC messages here
let awsCredentials = null;
ipcMain.on('set-user-credentials', (event, credentials) => {
  awsCredentials = credentials;
  console.log("Set User credentails Main")
});

ipcMain.handle('get-user-credentials', (event) => {
  return awsCredentials;
});

let awsGlobusCredentials = null;
ipcMain.on('set-globus-credentials', (event, resultCredentials) => {
  awsGlobusCredentials = resultCredentials;
  console.log("Set Globus credentails Main")
});

ipcMain.handle('get-globus-credentials', (event) => {
  return awsGlobusCredentials;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

