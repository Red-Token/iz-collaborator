export default true
import electron_1 from "electron"
import nodePath from "node:path"

import {fork} from "child_process"
import {fileURLToPath} from "url"
import log from "electron-log"

//path
const __filename = fileURLToPath(import.meta.url)
const __dirname = nodePath.dirname(__filename)

//help
const isDev = !electron_1.app.isPackaged
const isMac = process.platform === "darwin" ? true : false
const serverPath = isDev ? nodePath.join(__dirname, "build", "index.js") : nodePath.join(__dirname, "../build/index.js")
process.env.NODE_ENV = isDev ? "development" : "production"

// if (!isDev) {
//   const server = import(`./build/index.js`)
//     .then(server => server)
//     .catch(err => log.error(`Server Load Error: ${err}`))
// }

let mainWindow
// @type {electron_1.BrowserWindow | null}
log.info("App is packaged:", !isDev)

electron_1.app.on("ready", async () => {
  createWindow()

  mainWindow.on("close", () => {
    electron_1.app.quit()
  })
})

electron_1.app.on("window-all-closed", () => {
  if (!isMac) {
    electron_1.app.quit()
  }
})

electron_1.app.on("activate", () => {
  if (mainWindow === null) {
    //                        if (BrowserWindow.getAllWindows().length === 0)
    createWindow()
  }
})
async function createWindow() {
  log.info(`Server path: ${serverPath}`)
  fork(serverPath)

  mainWindow = new electron_1.BrowserWindow({
    title: `iz-collaborator`,
    width: 900,
    height: 600,
    resizable: !isDev ? true : false,
    show: true,
    webPreferences: {
      contextIsolation: true,
      devTools: isDev,
      nodeIntegration: true,
      //preload: path.join(__dirname, "preload.js"),
    },
  })

  mainWindow.loadURL("http://localhost:3000")

  mainWindow.on("ready-to-show", function () {
    if (mainWindow) {
      mainWindow.show()
    }
  })

  mainWindow.on("closed", function () {
    mainWindow = null
  })
}
