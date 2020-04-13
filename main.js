'use strict'

// "C:\Users\cullens\AppData\Local\Google\Chrome\User Data\Default\Extensions\fmkadmapgofadopljbjfkapdkoienihi"
// /home/common/.config/chromium/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0
// Import parts of electron to use
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

// For communication between windows or between window and electron process
// const { ipcMain } = require('electron')

const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

const os = require('os')
const fs = require('fs')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let updaterWindow = null

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

ipcMain.on('updaterMessage', (event, arg) => {
  console.log(arg) // prints "ping"
  if (arg.type === 'updateControl') {
    if (arg.payload === 'download') {
      autoUpdater.downloadUpdate()
    } else if (arg.payload === 'installAndRestart') {
      autoUpdater.quitAndInstall()
    }
  }
  // event.reply('asynchronous-reply', 'pong')
})

function createUpdaterWindow() {
  if (updaterWindow === null) {
    if (dev) {
      updaterWindow = new BrowserWindow({
        icon: path.join(resources, '96x96.png'),
        width: 800,
        height: 600,
        resizable: true,
        show: false,
        title: 'Updater',
      })
    } else {
      updaterWindow = new BrowserWindow({
        icon: path.join(resources, '96x96.png'),
        width: 400,
        height: 200,
        resizable: false,
        show: false,
        title: 'Updater',
      })
    }

    // updaterWindow.toggleDevTools()
  }

  // win.setMenuBarVisibility(false)
  // win.webContents.openDevTools();
  updaterWindow.on('closed', () => {
    updaterWindow = null
  })
  //   .AppUpdater ⇐ EventEmitter
  // .checkForUpdates() ⇒ Promise<UpdateCheckResult>
  // .checkForUpdatesAndNotify() ⇒ Promise< | UpdateCheckResult>
  // .downloadUpdate(cancellationToken) ⇒ Promise<any>
  // .getFeedURL() ⇒ undefined | null | String
  // .setFeedURL(options)
  // .quitAndInstall(isSilent, isForceRunAfter)
  updaterWindow.webContents.on('did-finish-load', function() {
    // setTimeout(() => updaterWindow.show(), 650)

    if (dev) {
      console.log('wats happening')
      updaterWindow.webContents.openDevTools()
    }
    updaterWindow.show()
    autoUpdater.autoDownload = false
    autoUpdater.checkForUpdates()

    const currentVersion = app.getVersion()
    sendVersionToWindow(currentVersion)
  })

  updaterWindow.on('page-title-updated', evt => {
    evt.preventDefault()
  })
}

function createWindow() {
  // and load the index.html of the app.
  let indexPath
  let updaterPath

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      hash: '/',
      host: 'localhost:8080',
      pathname: '/',
      slashes: true,
    })

    updaterPath = url.format({
      protocol: 'http:',
      hash: '/updater',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      hash: '/',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true,
    })

    updaterPath = url.format({
      protocol: 'file:',
      hash: '/updater',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true,
    })
  }
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
          label: 'Check For Updates',
          click: () => {
            createUpdaterWindow()
            updaterWindow.loadURL(updaterPath)
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
          label: 'Clear Cache',
          click: (menuItem, currentWindow) => {
            currentWindow.webContents.session.clearCache(() => {
              console.log('cache cleared')
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
        {
          label: 'Reset Redux to Defaults',
          submenu: [
            {
              label: 'Session Settings',
              click: (menuItem, currentWindow) => {
                currentWindow.webContents.send('menu-item', {
                  menuItem,
                  currentWindow,
                })
              },
              id: 'session-settings',
            },
          ],
        },
      ],
    },
  ])
  Menu.setApplicationMenu(null)

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 768,
    minWidth: 1250,
    minHeight: 768,
    show: false,
    icon: path.join(resources, '96x96.png'),
    title: 'Tile Viewer',
  })

  mainWindow.setMenu(menu)

  if (dev) {
    console.log(os.homedir())
    let reactDevToolsPath
    let reduxDevToolsPath

    if (process.platform === 'win32') {
      reactDevToolsPath = path.join(
        os.homedir(),
        'AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.6.0_3',
      )
      reduxDevToolsPath = path.join(
        os.homedir(),
        'AppData/Local/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0',
      )
    } else if (process.platform === 'linux') {
      // Ubuntu dev machine
      reactDevToolsPath = path.join(
        os.homedir(),
        '.config/chromium/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.6.0_3',
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

  console.log(updaterPath)

  mainWindow.loadURL(indexPath)

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    // Open the DevTools automatically if developing
    if (dev) {
      console.log('wats happening')

      mainWindow.webContents.openDevTools()
    }

    mainWindow.show()
    createUpdaterWindow()
    updaterWindow.loadURL(updaterPath)
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

function sendStatusToWindow(text) {
  log.info(text)
  updaterWindow.webContents.send('updaterMessage', {
    type: 'statusMessage',
    payload: text,
  })
}

function sendVersionToWindow(version) {
  log.info(version)
  updaterWindow.webContents.send('updaterMessage', {
    type: 'versionMessage',
    payload: version,
  })
}

function askUserToUpdate() {
  log.info('Update available, asking user to update')
  win.webContents.send('message', 'showUpdatePrompt###')
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.')

  console.log(info)

  const payloadString = JSON.stringify({
    version: info.version,
    os: process.platform,
  })
  updaterWindow.webContents.send('updaterMessage', {
    type: 'availableVersionMessage',
    payload: payloadString,
  })
})
autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.')
  const payloadString = JSON.stringify({
    version: info.version,
    os: process.platform,
  })
  updaterWindow.webContents.send('updaterMessage', {
    type: 'availableVersionMessage',
    payload: payloadString,
  })
})
autoUpdater.on('error', err => {
  sendStatusToWindow('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', progressObj => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  sendStatusToWindow('Downloading...')

  updaterWindow.webContents.send('updaterMessage', {
    type: 'downloadProgress',
    payload: JSON.stringify(progressObj),
  })
})

autoUpdater.on('update-downloaded', info => {
  sendStatusToWindow('Update downloaded.')
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
