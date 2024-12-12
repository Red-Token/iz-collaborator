
export default true;
import  electron_1  from "electron";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { randomBytes } from 'crypto';

/**
 * @type {electron_1.BrowserWindow | null}
 */
let mainWindow;
let nonce = randomBytes(16).toString('base64');
electron_1.app.on("ready", createWindow);
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            //preload: path.join(__dirname, "preload.js"),
        },
        show: false
    });
    mainWindow.loadFile('./electronapp/index.html', { query: { nonce: nonce } }).catch(function (err) {
        console.error("Error loading file:", err);
    });
    mainWindow.on("ready-to-show", function () {
        if (mainWindow) {
            mainWindow.show();
        }
    });
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});
