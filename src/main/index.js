"use strict";
import { app, BrowserWindow, screen, shell, Menu } from "electron";

import Positioner from "electron-positioner";
import * as path from "path";
import { format as formatUrl } from "url";
import { WebMessenger } from "./WebMessenger";

const defaultMenu = require("electron-default-menu");
const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;
let webMessenger;
app.setAsDefaultProtocolClient("post-tweet");
// Force Single Instance Application
const shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.focus();
    }
});
if (shouldQuit) {
    app.quit();
}

function createMainWindow() {
    const mainScreen = screen.getPrimaryDisplay();
    const dimensions = mainScreen.size;
    const window = new BrowserWindow({
        title: "post-tweet",
        frame: false,
        width: dimensions.width - 80,
        height: 150,
        transparent: true
    });
    const positioner = new Positioner(window);
    positioner.move("bottomCenter");
    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    } else {
        window.loadURL(
            formatUrl({
                pathname: path.join(__dirname, "index.html"),
                protocol: "file",
                slashes: true
            })
        );
    }

    window.on("closed", () => {
        mainWindow = null;
    });

    window.webContents.on("devtools-opened", () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow();
        webMessenger = new WebMessenger(mainWindow.webContents);
    }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow();
    webMessenger = new WebMessenger(mainWindow.webContents);

    const menu = defaultMenu(app, shell);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
});

app.on("open-url", function(event, url) {
    event.preventDefault();
    logEverywhere("open-url event: " + url, event);
});

function logEverywhere(...args) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${args}")`);
    }
}
