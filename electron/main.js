export default true
import electron_1 from "electron"
import path from "path"

import {fork} from "child_process"
import {fileURLToPath} from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
process.env.NODE_ENV = electron_1.app.isPackaged ? "production" : "development"

// @type {electron_1.BrowserWindow | null}
let mainWindow
const isPackaged = electron_1.app.isPackaged
console.log("App is packaged:", electron_1.app.isPackaged)

const serverPath = isPackaged
  ? path.join(__dirname, "build", "index.js")
  : path.join(__dirname, "../build/index.js")

electron_1.app.on("ready", createWindow)

function createWindow() {
  console.log("Server path:", serverPath)
  fork(serverPath)

  mainWindow = new electron_1.BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      //preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  })
  mainWindow.loadURL("http://localhost:3000")

  mainWindow.on("ready-to-show", function () {
    if (mainWindow) {
      mainWindow.show()
    }
  })
  mainWindow.webContents.openDevTools()
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error(`Ошибка загрузки: ${errorCode} - ${errorDescription}`)
  })
  mainWindow.on("closed", function () {
    mainWindow = null
  })
}
electron_1.app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    electron_1.app.quit()
  }
})
electron_1.app.on("activate", function () {
  if (mainWindow === null) {
    createWindow()
  }
})
