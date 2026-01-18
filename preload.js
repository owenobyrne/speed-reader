const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Expose file API via IPC to main process
contextBridge.exposeInMainWorld('fileAPI', {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  getExtension: (filePath) => ipcRenderer.invoke('get-extension', filePath),
  readTextFile: (filePath) => ipcRenderer.invoke('read-text-file', filePath),
  parsePDF: (filePath) => ipcRenderer.invoke('parse-pdf', filePath),
  parseDocx: (filePath) => ipcRenderer.invoke('parse-docx', filePath),
  isURL: (str) => ipcRenderer.invoke('is-url', str),
  fetchURL: (url) => ipcRenderer.invoke('fetch-url', url)
});
