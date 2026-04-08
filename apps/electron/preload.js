// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        getMacAddresses: () => ipcRenderer.invoke('get-mac-addresses'),
        platform: process.platform,
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
    },
);