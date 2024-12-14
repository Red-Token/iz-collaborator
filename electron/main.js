import {app, BrowserWindow, Tray, Menu, shell } from "electron"
import nodePath from "node:path"
import {fork} from "child_process"
import {fileURLToPath} from "url"
//import log from "electron-log" //TODO Need test the import at production

//path
const __filename = fileURLToPath(import.meta.url)
const __dirname = nodePath.dirname(__filename)

//help
const isDev = !app.isPackaged
const isMac = process.platform === "darwin" ? true : false
const serverPath = isDev ? nodePath.join(__dirname, "./build/index.js") : nodePath.join(__dirname, "build", "index.js")

///TODO Add a delay for rendering before starting the server.

let tray
let mainWindow

console.log("App is packaged:", !isDev)

app.on("ready", async () => {
  createWindow()

  tray = new Tray(nodePath.join(__dirname, "build", "client", "pwa-64x64.png"))

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

async function createWindow() {
  console.log(`Server path: ${serverPath}`)
  fork(serverPath)

  mainWindow = new BrowserWindow({
    title: `iz-collaborator`,
    width: 900,
    height: 600,
    show: true,
    webPreferences: {
      contextIsolation: true,
      //devTools: isDev, //TODO Uncomment before release
      nodeIntegration: true,
      //preload: path.join(__dirname, "preload.js"),
    },
  })

  mainWindow.loadURL("http://localhost:3000")

  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault() 
    shell.openExternal(url)
  })

  mainWindow.on("ready-to-show", () => {
    if (mainWindow) {
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
