const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable GPU acceleration to avoid GPU process errors on some systems
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

// Lazy-loaded dependencies (heavy libs loaded only when needed)
let JSDOM, Readability, pdfParse, mammoth;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: -100, y: -100 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

// IPC Handlers for file operations
ipcMain.handle('get-extension', (event, filePath) => {
  return path.extname(filePath).toLowerCase();
});

ipcMain.handle('read-text-file', (event, filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
});

ipcMain.handle('parse-pdf', async (event, filePath) => {
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
});

ipcMain.handle('parse-docx', async (event, filePath) => {
  if (!mammoth) {
    const mammothModule = require('mammoth');
    mammoth = mammothModule.default || mammothModule;
  }
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
});

ipcMain.handle('is-url', (event, str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
});

// Window control IPC handlers
ipcMain.handle('minimize-window', (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize();
});

ipcMain.handle('close-window', (event) => {
  BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.handle('fetch-url', async (event, url) => {
  if (!JSDOM) JSDOM = require('jsdom').JSDOM;
  if (!Readability) Readability = require('@mozilla/readability').Readability;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent) {
    throw new Error('Could not extract article content from this URL');
  }

  return article.textContent;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: re-create window when dock icon clicked and no windows open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // macOS: keep app running until explicit Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
