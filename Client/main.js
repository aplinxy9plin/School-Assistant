const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
/*  mainWindow = new BrowserWindow({width: 800, height: 600})

  let NetSchoolURL = 'http://78.140.18.5'

  mainWindow.loadURL(NetSchoolURL)

  mainWindow.webContents.on('dom-ready', function(e) {
    nowURL = mainWindow.webContents.getURL()
    console.log(nowURL);
    //mainWindow.webContents.executeJavaScript("document.getElementById('user[login]').value = 'testpick'")
  })
*/

  // Good
  mainWindow = new BrowserWindow({
    webPreferences: {
      width: 800,
      height: 600,
      nodeIntegration: false
    }
  })

  let NetSchoolURL = 'http://78.140.18.5/'

  mainWindow.loadURL(NetSchoolURL)

  mainWindow.webContents.on('dom-ready', function(e) {
    nowURL = mainWindow.webContents.getURL()
    console.log(nowURL);
    auth = `document.getElementsByName('UN')[0].value = 'Аплин';
            document.getElementsByName('PW')[0].value = '222222';`
    if(nowURL == NetSchoolURL){
      mainWindow.webContents.executeJavaScript(auth, () => {
        setTimeout(buttonLogin, 1000);
      })
      function buttonLogin(){
        mainWindow.webContents.executeJavaScript("document.getElementsByClassName('button-login')[0].click();")
      }
    }
    if(nowURL == 'http://78.140.18.5/asp/Curriculum/Assignments.asp'){
      console.log('auth success');
    }
    if(nowURL == 'http://78.140.18.5/asp/SecurityWarning.asp'){
      console.log('auth success, but SecurityWarning');
      mainWindow.webContents.executeJavaScript("doContinue()")
    }
  })

  //mainWindow.webContents.

  // and load the index.html of the app.
  /*mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))*/

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
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
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
