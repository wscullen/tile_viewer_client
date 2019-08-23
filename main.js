'use strict'

// "C:\Users\cullens\AppData\Local\Google\Chrome\User Data\Default\Extensions\fmkadmapgofadopljbjfkapdkoienihi"
// /home/common/.config/chromium/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0
// Import parts of electron to use
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

// For communication between windows or between window and electron process
// const { ipcMain } = require('electron')

// ipcMain.on('asynchronous-message', (event, arg) => {
//   console.log(arg) // prints "ping"
//   if (arg === 'exit')
//     app.quit()
//   // event.reply('asynchronous-reply', 'pong')
// })

const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

const os = require('os')
const fs = require('fs')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Keep a reference for dev mode
let dev = false

if (
  process.defaultApp ||
  /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
  /[\\/]electron[\\/]/.test(process.execPath)
) {
  dev = true
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
}

let resources

if (dev) {
  resources = path.join(__dirname, 'assets', 'icons')
  console.log(__dirname)
} else {
  resources = path.join(process.resourcesPath, '..', 'assets', 'icons')
  console.log(resources)
}

function createWindow() {
  var menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          click: (menuItem, currentWindow) => {
            currentWindow.webContents.send('menu-item', {
              menuItem,
              currentWindow,
            })
          },
        },
        {
          label: 'Exit',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Dev',
      submenu: [
        {
          label: 'Clear Local Storage',
          click: (menuItem, currentWindow) => {
            console.log(menuItem)
            currentWindow.webContents.send('menu-item', {
              menuItem,
              currentWindow,
            })
          },
        },
        {
          label: 'Reload',
          click: (menuItem, currentWindow) => {
            console.log(menuItem)
            currentWindow.webContents.reload()
          },
        },
        {
          label: 'Hard Reload',
          click: (menuItem, currentWindow) => {
            console.log(menuItem)
            currentWindow.webContents.reloadIgnoringCache()
          },
        },
        {
          label: 'Toggle Dev Tools',
          click: (menuItem, currentWindow) => {
            console.log(menuItem)
            currentWindow.toggleDevTools()
          },
        },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 768,
    minWidth: 1000,
    minHeight: 768,
    show: false,
    icon: path.join(resources, '96x96.png'),
  })

  if (dev) {
    console.log(os.homedir())
    let reactDevToolsPath
    let reduxDevToolsPath

    if (process.platform === 'win32') {
      reactDevToolsPath = path.join(
        os.homedir(),
        'AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.0.5_0',
      )
      reduxDevToolsPath = path.join(
        os.homedir(),
        'AppData/Local/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0',
      )
    } else if (process.platform === 'linux') {
      // Ubuntu dev machine
      reactDevToolsPath = path.join(
        os.homedir(),
        '.config/chromium/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.0.5_0',
      )
      reduxDevToolsPath = path.join(
        os.homedir(),
        '.config/chromium/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0',
      )
    }
    console.log(reactDevToolsPath)
    console.log(reduxDevToolsPath)

    if (fs.existsSync(reactDevToolsPath)) {
      BrowserWindow.addDevToolsExtension(reactDevToolsPath)
    }

    if (fs.existsSync(reduxDevToolsPath)) {
      BrowserWindow.addDevToolsExtension(reduxDevToolsPath)
    }
  }
  // and load the index.html of the app.
  let indexPath

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true,
    })
  }

  createDefaultWindow()

  autoUpdater.checkForUpdatesAndNotify()

  mainWindow.loadURL(indexPath)

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    // Open the DevTools automatically if developing
    if (dev) {
      console.log('wats happening')

      mainWindow.webContents.openDevTools()
    }
    mainWindow.show()
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

let win

function sendStatusToWindow(text) {
  log.info(text)
  win.webContents.send('message', text)
}

function createDefaultWindow() {
  win = new BrowserWindow({
    icon: path.join(resources, '96x96.png'),
    width: 400,
    height: 200,
    resizable: false,
  })

  // win.setMenuBarVisibility(false)
  // win.webContents.openDevTools();
  win.on('closed', () => {
    win = null
  })
  win.loadURL(`file://${__dirname}/version.html#${app.getVersion()}`)
  return win
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.')
})
autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.')
})
autoUpdater.on('error', err => {
  sendStatusToWindow('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', progressObj => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  sendStatusToWindow(log_message)
})
autoUpdater.on('update-downloaded', info => {
  sendStatusToWindow('Update downloaded')
})

// app.on('ready', function() {
//   // Create the Menu
//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);

//   createDefaultWindow();
// });

// app.on('window-all-closed', () => {
//   app.quit();
// });

//
// CHOOSE one of the following options for Auto updates
//

// -------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
// -------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdatesAndNotify();
// });
