const express = require('express');
const setRoutes = require('./routes/index'); // 不用解构
const { app: electronApp, BrowserWindow } = require('electron');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

let randmkerProcess = null;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes
setRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // 启动 lib 目录下的 randmker.exe，工作目录也为 lib，隐式打开命令行窗口
    const libPath = require('path').join(process.cwd(), 'lib');
    randmkerProcess = spawn('randmker.exe', {
        cwd: libPath,
        windowsHide: true,
    });

    electronApp.whenReady().then(() => {
        const win = new BrowserWindow({
            fullscreen: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        win.loadURL(`http://localhost:8086`);
        win.on('closed', () => {
            cleanupRandmker();
            electronApp.quit();
        });
    });

    electronApp.on('window-all-closed', () => {
        cleanupRandmker();
        electronApp.quit();
    });
});

// 进程退出时清理
function cleanupRandmker() {
    if (randmkerProcess) {
        randmkerProcess.kill();
        randmkerProcess = null;
    }
}

process.on('exit', cleanupRandmker);
process.on('SIGINT', () => {
    cleanupRandmker();
    process.exit();
});
process.on('SIGTERM', () => {
    cleanupRandmker();
    process.exit();
});
process.on('uncaughtException', (err) => {
    console.error(err);
    cleanupRandmker();
    process.exit(1);
});