import { app, BrowserWindow } from 'electron';
//import  path from "path";
//import join from 'path';
//import { fileURLToPath } from 'url';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;



app.on("ready", createWindow);

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            //preload: path.join(__dirname, "preload.js"),
        },
        show: false
    });

    // if (process.env.NODE_ENV === 'development') {
    //     mainWindow.loadURL('http://localhost:3000');
    // }
    // else {
    mainWindow.loadFile('./electronapp/index.html').catch(err => {  
        console.error("Error loading file:", err);
    });
    //}

    mainWindow.on("ready-to-show", () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});