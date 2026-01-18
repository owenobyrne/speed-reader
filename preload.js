const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('fileAPI', {
  readFile: (filePath) => fs.readFileSync(filePath),
  getExtension: (filePath) => path.extname(filePath).toLowerCase()
});
