// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const { spawn } = require('child_process');


let puppeteerScript;

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 用于安全通信
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  puppeteerScript = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  puppeteerScript.stdout.on('data', (data) => {
    console.log(`[Puppeteer]: ${data}`);
  });

  puppeteerScript.stderr.on('data', (data) => {
    console.error(`[Puppeteer Error]: ${data}`);
  });

  puppeteerScript.on('close', (code) => {
    console.log(`[Puppeteer] exited with code ${code}`);
    puppeteerScript = null;
    if (mainWindow) {
      mainWindow.webContents.send('puppeteer-status', false);
    }
  });

  if (mainWindow) {
    mainWindow.webContents.send('puppeteer-status', true);
  }
});


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
  if (puppeteerScript) puppeteerScript.kill(); // 关闭 Puppeteer 子进程
});

// 启动 puppeteer 脚本
ipcMain.on('puppeteer-start', () => {
  if (!puppeteerScript) {
    puppeteerScript = fork('./index.js', [], { stdio: 'inherit' });
  }
});

ipcMain.on('puppeteer-command', (_, command) => {
  if (puppeteerScript && puppeteerScript.stdin.writable) {
    puppeteerScript.stdin.write(`${command}\n`);
  } else {
    dialog.showErrorBox("Puppeteer 未启动", "请稍等 Puppeteer 启动完成，或重启应用。");
  }
});
