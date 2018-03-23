const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

var express = require('express')
var server = express()

server.get('/', (req,res) => {
  res.send('html')
})

server.get('/update', (req,res) => {
  createWindow()
  res.send('updated')
})

server.listen(1337, function(){
  console.log('App server is running');
})

const path = require('path')
const url = require('url')

var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');

var moment = require('moment')
var now = moment().format("DD.MM.YY")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Good
  mainWindow = new BrowserWindow({
    webPreferences: {
      width: 800,
      height: 600,
      nodeIntegration: false
    }
  })

  let NetSchoolURL = 'http://78.140.18.5/'
  let login = 'Аплин'
  let password = '222222'
  mainWindow.loadURL(NetSchoolURL)

  mainWindow.webContents.on('dom-ready', function(e) {
    nowURL = mainWindow.webContents.getURL()
    console.log(nowURL);
    auth = `document.getElementsByName('UN')[0].value = '`+login+`';
            document.getElementsByName('PW')[0].value = '`+password+`';`
    if(nowURL == NetSchoolURL){
      mainWindow.webContents.executeJavaScript(auth, () => {
        setTimeout(buttonLogin, 1000);
      })
      function buttonLogin(){
        mainWindow.webContents.executeJavaScript("document.getElementsByClassName('button-login')[0].click();")
      }
    }
    if(nowURL == 'http://78.140.18.5/asp/SecurityWarning.asp'){
      console.log('auth success, but SecurityWarning');
      mainWindow.webContents.executeJavaScript("doContinue()")
    }
    if(nowURL == 'http://78.140.18.5/asp/Curriculum/Assignments.asp'){
      console.log('auth success');
      getTable = `
        //for (var i = 0; i < 15; i++) {
          //document.getElementsByTagName('tr')[0]
        //}`
      mainWindow.webContents.executeJavaScript(`document.getElementsByTagName('table')[0].innerHTML`, function (result) {
        result = '<table>' + result + '</table>'
        const $ = cheerio.load(result)

        cheerioTableparser($);

        var data = $("table").parsetable(true, true, true);
        todayWork(data, now)
        function allWork(data){
          for (var i = 1; i < data[1].length; i++) {
            if(data[1][i] !== data[2][i] &&  data[3][i] !== data[4][i]){
              console.log(data[1][i]); // предмет
              console.log(data[2][i]); // тип задания
              console.log(data[3][i]); // задание
              console.log(data[4][i]); // отметка
            }else{
              console.log('\n'+data[1][i]); // предмет
            }
          }
        }

        function todayWork(data, now){
          for (var i = 1; i < data[1].length; i++) {
            if(data[1][i].indexOf(now) >= 0){
              console.log(now);
              i++
              while(data[1][i] !== data[2][i] &&  data[3][i] !== data[4][i]){
                console.log(data[1][i] + data[2][i] + data[3][i] + data[4][i] + '\n');
                i++
              }
            }
          }
        }
      })
      //table table-bordered table-thin table-xs print-block
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
