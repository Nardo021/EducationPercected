// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendCommand: (command) => ipcRenderer.send('puppeteer-command', command),
  onStatusUpdate: (callback) => ipcRenderer.on('puppeteer-status', (_, ready) => callback(ready)),
});

