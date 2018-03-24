const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

var express = require('express')
var server = express()

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "top4ek",
  password: "q2w3e4r5",
  database: "school_assistant"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM users", function (err, result, fields) {
    if (err) throw err;
    console.log('Database connection is success');
  });
});

const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')

const telegram = new Telegraf('572029181:AAEsGGbVdpl0DsJRJHYL_r8SV1RmZMSch6w')

telegram.startPolling()

telegram.command('start', ({from,reply}) => {
  con.query("INSERT INTO coffee (chat_id, status) VALUES ("+from.id+", 'choose_service'") function(err, result){
    reply('Привет, выбери свой дневник', Markup
      .keyboard(['NetSchool', 'Sd.tom.ru'])
      .resize()
      .extra()
    )
  })
})

telegram.on('message', (ctx) => {
  var chat_id = ctx.from.id
  var message = ctx.message.text
  con.query("SELECT status, service, login, password FROM users WHERE chat_id = "+chat_id+"", function(err, result){
    if(result[0] !== undefined){
      var status = result[0].status
      switch (status) {
        case 'choose_service':
          if(message == 'NetSchool'){
            con.query("UPDATE users SET service = 'NetSchool', status = 'service_accept' WHERE chat_id = "+chat_id+"", function(err, res){
              ctx.reply('Вы выбрали NetSchool. Все верно?', Markup
                .keyboard(['Да', 'Нет'])
                .resize()
                .extra()
              )
            })
          }else if (message == 'Sd.tom.ru') {
            con.query("UPDATE users SET service = 'NetSchool', status = 'service_accept' WHERE chat_id = "+chat_id+"", function(err, res){
              ctx.reply('Вы выбрали sd.tom.ru. Все верно?', Markup
                .keyboard(['Да', 'Нет'])
                .resize()
                .extra()
              )
            })
          }else{
            ctx.reply('Привет, выбери свой дневник', Markup
              .keyboard(['NetSchool', 'Sd.tom.ru'])
              .resize()
              .extra()
            )
          }
          break;
        case 'service_accept':
          if(message == 'Да'){
            updateStatus(chat_id, 'get_login')
            ctx.reply("Отлично, теперь напиши свой логин для доступа к журналу.")
          }else if (message == 'Нет') {
            con.query("UPDATE users SET status = 'choose_service' WHERE chat_id = '"+chat_id+"'", function(err, res){
              ctx.reply('Привет, выбери свой дневник', Markup
                .keyboard(['NetSchool', 'Sd.tom.ru'])
                .resize()
                .extra()
              )
            })
          }else{
            ctx.reply('Вы выбрали '+result[0].service+'. Все верно?', Markup
              .keyboard(['Да', 'Нет'])
              .resize()
              .extra()
            )
          }
          break;
        case 'get_login':
          con.query("UPDATE users SET login = "+message+", status = 'login_check' WHERE chat_id = "+chat_id+"", function(err, res){
            ctx.reply('Ваш логин - '+message+'?', Markup
              .keyboard(['Да', 'Нет'])
              .resize()
              .extra()
            )
          })
          break;
        case 'login_check':
          if (message == 'Да') {
            //con.query("UPDATE users SET login = "+message+"")
          }else if (message == 'Нет') {
            updateStatus(chat_id, 'get_login')
            ctx.reply("Напиши свой логин для доступа к журналу.")
          }else{
            ctx.reply('Ваш логин - '+result[0].login+'?', Markup
              .keyboard(['Да', 'Нет'])
              .resize()
              .extra()
            )
          }
          break;
        default:

      }
    }else{
      con.query("INSERT INTO coffee (chat_id, status) VALUES ("+chat_id+", 'choose_service'") function(err, result){
        reply('Привет, выбери свой дневник', Markup
          .keyboard(['NetSchool', 'Sd.tom.ru'])
          .resize()
          .extra()
        )
      })
    }
  })
})

function updateStatus(chat_id, status){
  con.query("UPDATE users SET status = '"+status+"' WHERE chat_id = "+chat_id+"")
}

server.get('/', (req,res) => {
  res.send('html')
})

server.get('/update', (req,res) => {
  var login = req.query.login
  var password = req.query.password
  createWindow(login, password)
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

function createWindow (login, password) {

  // Good
  mainWindow = new BrowserWindow({
    webPreferences: {
      width: 800,
      height: 600,
      nodeIntegration: false
    }
  })

  let NetSchoolURL = 'http://78.140.18.5/'

  var checkPass = false
  //let login = 'Аплин'
  //let password = '222222'
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
        setTimeout(errorCheck, 1000);
      }
      function errorCheck(){
        mainWindow.webContents.executeJavaScript("document.getElementsByClassName('modal-dialog').length;", function(result){
          if(result == '1'){
            // Send BAD PASSWORD ERROR
            console.log('Bad Password for '+login);
            mainWindow.close()
          }
        })
      }
      checkPass = true
    }
    if(checkPass == false && nowURL == NetSchoolURL){
      console.log('Bad Password');
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

        //todayWork(data, now)

        allWork(data)

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
app.on('ready', () => {
  createWindow('Аплин','222222')
})

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
    createWindow('Аплин','222222')
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
