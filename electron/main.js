import {app, BrowserWindow, Tray, Menu, shell} from "electron"
import nodePath from "node:path"
import {fork} from "child_process"
import {fileURLToPath} from "url"
//import log from "electron-log" // or 'electron-log/main' ; TODO Need test the import at production

//path
const __filename = fileURLToPath(import.meta.url)
const __dirname = nodePath.dirname(__filename)

//help
const isDev = !app.isPackaged
const isMac = process.platform === "darwin" ? true : false
const serverPath = isDev
  ? nodePath.join(__dirname, "./build/index.js")
  : nodePath.join(__dirname, "build", "index.js")

///TODO Add a delay for rendering before starting the server.

let tray
let mainWindow 



console.log("App is packaged:", !isDev)

// only one instance
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  
   app.on("ready", async () => {
    

    createWindow()

    /// Remove app Menu
    Menu.setApplicationMenu(null)

    /// Add Contect Menu
    tray = new Tray(nodePath.join(__dirname, "build", "client", "icon_32x32.png"))

    tray.setToolTip("iz-collaborator")

    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: "Show",
          click: () => {
            mainWindow.show()
          },
        },
        {
          label: "Quit",
          click: () => {
            app.isQuiting = true
            app.quit()
          },
        },
      ]),
    )

    tray.on("click", () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()))
  })

  app.on("window-all-closed", () => {
    if (!isMac) {
      app.quit()
    }
  })

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      
      createWindow()
    }
  })
}
async function createWindow() {
  console.log(`Server path: ${serverPath}`)
  fork(serverPath)
  mainWindow = new BrowserWindow({
    title: `iz-collaborator`,
    width: 900,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: true,
      //devTools: isDev, //TODO Uncomment before release
      nodeIntegration: true,
      //preload: path.join(__dirname, "preload.js"),
    },
  })
  mainWindow.loadURL("http://localhost:3000")

  mainWindow.webContents.on("new-window", (event, url) => { ///TODO fix it
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.on("ready-to-show", async () => {
    if (mainWindow) {
      await delay(1000)
      mainWindow.show()
    }
  })

  mainWindow.on("close", event => {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on("minimize", event => {
    mainWindow.hide()
  })
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
