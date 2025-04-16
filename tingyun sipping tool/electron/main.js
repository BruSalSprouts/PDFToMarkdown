const { app, BrowserWindow, ipcMain, dialog, desktopCapturer, screen, contextBridge } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = require("electron-is-dev")
const server = require('./server')

// At the top of your main.js file, add:
contextBridge.exposeInMainWorld('electron', {
  fileSystem: {
    openFile: () => ipcRenderer.invoke('open-file-dialog'),
    saveFile: (options) => ipcRenderer.invoke('save-file', options)
  },
  windowControls: {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window')
  },
  screenCapture: {
    getSources: () => ipcRenderer.invoke('get-screen-sources')
  }
})

// Keep a global reference of the window object to prevent garbage collection
let mainWindow

// Start the backend server
const PORT = 3001
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: Math.min(1200, width),
    height: Math.min(800, height),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, "../public/tingyun-logo.png"),
    frame: false, // Frameless window for custom title bar
  })

  // Load the Next.js app
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Window management
  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// IPC handlers for window controls
ipcMain.on("minimize-window", () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on("maximize-window", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on("close-window", () => {
  if (mainWindow) mainWindow.close()
})

// File system operations
ipcMain.handle("open-file-dialog", async (event, options) => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    ...options,
  })

  if (filePaths && filePaths.length > 0) {
    const filePath = filePaths[0]
    const fileName = path.basename(filePath)
    const fileData = fs.readFileSync(filePath)

    return {
      path: filePath,
      name: fileName,
      data: fileData.toString("base64"),
    }
  }

  return null
})

ipcMain.handle("save-file", async (event, { content, defaultPath, filters }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters,
  })

  if (filePath) {
    fs.writeFileSync(filePath, content)
    return true
  }

  return false
})

// Screen capture functionality
ipcMain.handle("get-screen-sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 320, height: 180 },
  })

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
  }))
})

ipcMain.handle("capture-screen", async (event, sourceId) => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 1920, height: 1080 },
  })
  const selectedSource = sources.find((source) => source.id === sourceId)
  return selectedSource ? selectedSource.thumbnail.toDataURL() : null
})

ipcMain.handle("capture-screen-area", async (event, bounds) => {
  const { x, y, width, height } = bounds
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: width * 2, height: height * 2 }, // Higher resolution for better quality
  })

  if (sources.length === 0) return null

  // Get the primary display screenshot
  const screenshot = sources[0].thumbnail

  // Create a canvas to crop the area
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Draw the cropped area
  ctx.drawImage(
    screenshot,
    x * 2,
    y * 2,
    width * 2,
    height * 2, // Source coordinates (adjusted for thumbnailSize)
    0,
    0,
    width,
    height // Destination coordinates
  )

  // Convert to base64
  const blob = await canvas.convertToBlob()
  const reader = new FileReader()
  return new Promise((resolve) => {
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
})
