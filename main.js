const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Window references at module scope for z-order management
let mainWindow = null;
let backdropWindow = null;

// Disable GPU acceleration to avoid GPU process errors on some systems
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

// Lazy-loaded dependencies (heavy libs loaded only when needed)
let JSDOM, Readability, pdfParse, mammoth;

/**
 * Create a fullscreen dark backdrop window for focus mode.
 * Non-focusable so clicks pass through to main window.
 * Optimized for ultrawide monitors.
 */
function createBackdropWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  backdropWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: false,
    skipTaskbar: true,
    focusable: false,
    alwaysOnTop: true,
    type: 'desktop',
    show: false, // Start hidden - will be shown when overlay is toggled on
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // No HTML loading needed - just use backgroundColor

  // Use fullscreen for complete coverage
  backdropWindow.setFullScreen(true);
  backdropWindow.setAlwaysOnTop(true, 'normal');

  backdropWindow.on('closed', () => {
    backdropWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 150,
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

  // Clean up backdrop when main window closes
  mainWindow.on('closed', () => {
    if (backdropWindow && !backdropWindow.isDestroyed()) {
      backdropWindow.destroy();
    }
    mainWindow = null;
  });
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

// Focus overlay toggle
ipcMain.handle('toggle-focus-overlay', (event) => {
  if (backdropWindow && !backdropWindow.isDestroyed()) {
    if (backdropWindow.isVisible()) {
      // Backdrop is visible - hide it completely
      backdropWindow.hide();
      // Reset main window z-order to normal
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(false);
      }
      return false; // Overlay is now off
    } else {
      // Backdrop is hidden - show it
      backdropWindow.setOpacity(0.85);
      backdropWindow.show();
      // Elevate main window above backdrop
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(true, 'floating');
        mainWindow.focus();
      }
      return true; // Overlay is now on
    }
  } else {
    // Backdrop doesn't exist - create it
    createBackdropWindow();
    backdropWindow.setOpacity(0.85);
    backdropWindow.show();
    // Elevate main window above backdrop
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, 'floating');
      mainWindow.focus();
    }
    return true;
  }
});

// Show focus overlay (without toggle - for auto-show on content load)
ipcMain.handle('show-focus-overlay', (event) => {
  if (!backdropWindow || backdropWindow.isDestroyed()) {
    createBackdropWindow();
  }
  backdropWindow.setOpacity(0.85);
  backdropWindow.show();
  // Elevate main window above backdrop
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.focus();
  }
  return true;
});

// Hide focus overlay
ipcMain.handle('hide-focus-overlay', (event) => {
  if (backdropWindow && !backdropWindow.isDestroyed()) {
    backdropWindow.hide();
  }
  // Reset main window z-order to normal
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(false);
  }
  return false;
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
  createBackdropWindow(); // Pre-create backdrop for instant toggling

  // Set main window above backdrop from the start
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(true, 'floating');
  }

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
