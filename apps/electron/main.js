// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { networkInterfaces } = require('os');
const path = require('path');

// URL của web app trên Vercel
const VERCEL_URL = 'https://loot.vn';
// const VERCEL_URL = 'http://localhost:7900';
// const VERCEL_URL = 'https://loot.vn/admin-login';

let win;

function createWindow() {
    win = new BrowserWindow({

        width: 1920, // Default to Full HD width
        height: 1080, // Default to Full HD height
        icon: path.join(__dirname, "assets/logo.ico"),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false, // Tăng tính bảo mật
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load URL từ Vercel
    win.loadURL(VERCEL_URL);

    // Optional: Mở DevTool
    // win.webContents.openDevTools();
}

// Hàm lấy MAC addresses
function getMacAddresses() {
    const interfaces = networkInterfaces();
    const macAddresses = [];

    for (const interfaceName in interfaces) {
        const networkInterface = interfaces[interfaceName];
        for (const interface of networkInterface) {
            if (!interface.internal && interface.mac !== '00:00:00:00:00:00' && interface.family === 'IPv4') {
                macAddresses.push({
                    name: interfaceName,
                    address: interface.mac,
                    type: 'MAC'
                });
            }
        }
    }

    return macAddresses;
}

let gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Handle IPC calls
    ipcMain.handle('get-mac-addresses', () => {
        return getMacAddresses();
    });

    ipcMain.on("close-app", () => {
        app.quit(); // Closes the Electron app
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});