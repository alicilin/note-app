'use strict'
const { app, protocol, BrowserWindow } = require('electron');
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib');
const fs = require('fs-extra');
const main = require('@electron/remote/main');
const Knex = require('knex');
const path = require('path');
const os = require('os');
//------------------------------------------------------------------------
let isDevelopment = process.env.NODE_ENV !== 'production';
let mwindow = null;
let splash = null;
//------------------------------------------------------------------
protocol.registerSchemesAsPrivileged(
    [
        {
            scheme: 'app',
            privileges: {
                secure: true,
                standard: true
            }
        }
    ]
);

async function setup() {
    let D_OK = await fs.pathExists(path.join(os.homedir(), 'Not'));
    if (D_OK === false) {
        await fs.ensureDir(path.join(os.homedir(), 'Not'));
    }

    let cparams = {
        client: 'sqlite3',
        useNullAsDefault: true,
        migrations: {
            directory: path.join(__dirname, 'migrations')
        },
        connection: {
            filename: path.join(os.homedir(), 'Note', 'notes.db'),
        }
    }

    let knex = Knex(cparams);
    await knex.migrate.latest();
}

async function createWindow() {
    await setup();
    mwindow = new BrowserWindow(
        {
            width: 1366,
            height: 768,
            minHeight: 768,
            minWidth: 1366,
            resizable: true,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                zoomFactor: 0.85,
                enableRemoteModule: true
            }
        }
    );
    
    main.enable(mwindow.webContents);
    main.initialize();
    //----------------------------------------------------------------
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await mwindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) {
            mwindow.webContents.openDevTools({ mode: 'detach' });
        }
    } else {
        createProtocol('app');
        mwindow.loadURL('app://./index.html');
    }
}

function onAllClosed() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

function onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}

function onReady() {
    splash = new BrowserWindow(
        {
            width: 200,
            height: 200,
            transparent: true,
            frame: false,
            alwaysOnTop: true,
            center: true
        }
    );

    splash.loadFile(`${__static}/load.gif`);
    let created = () => {
        let isReady = () => {
            splash.destroy();
            mwindow.show();
        }

        mwindow.on('ready-to-show', isReady);
    }

    createWindow().then(created);
}

app.on('window-all-closed', onAllClosed);
app.on('activate', onActivate);
app.on('ready', onReady);
// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => app.quit());
    }
}
