
/*
 * NOTE: this main.js is only used when running print-preview directly.
 * it is NOT used when print-preview called from gch, EVEN in dev mode.
 * instead, projects/desktop/main.js has similar code to here.
 */
const { app, protocol, BrowserWindow,  Menu, ipcMain, ipcRenderer, shell, dialog, globalShortcut } = require('electron')
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const url = require('url');
const debug = require('debug')('electron:main');
const os = require('os')

const args = process.argv.slice(1);
const doCover = args.some(val => val === '--cover');

async function createWindow() {
  let title = "GreenCardHero: Spouse Edition";

  // Create the browser window.
  let win = new BrowserWindow({ 
    titleBarStyle: "hiddenInset", 
    title: title,
    width: 600, 
    height: 600 ,
    webPreferences: {
      webSecurity: true,
      nodeIntegration : false,
      contextIsolation: true,
      // enableRemoteModule: true,
      preload : path.join(__dirname, 'preload.js'),
    }
  })

  win.loadFile(path.join(__dirname, "index.html"));
  // win.loadURL('https://google.com');

  win.on('closed', () => {
    debug("win.on('closed')");
    win = null;
    app.quit()
  });

  // openDevTools(win);

  setupSaveToPDF();
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  debug("window-all-closed");
  app.quit();
});

function openDevTools(w) {
  let devtools = new BrowserWindow();
  w.webContents.setDevToolsWebContents(devtools.webContents);
  w.webContents.openDevTools({mode: 'detach'})
}

function print (wc) {
  wc.print({
    printBackground: true,
  });
}

function setupSaveToPDF () {
  ipcMain.on('saveToPDF', (event, defaultBaseName) => {
    console.log("received saveToPDF");
    const webContents = event.sender
    savePDF(webContents, defaultBaseName);
  });

  // savePDF(wc, defaultBaseName) - returns true if written, false if cancelled, errors if couldn't write
  // wc should be the webContext of the window you're trying to print a pdf of. 
  // defaultName should be something like 'i-130-a' or something
  async function savePDF (wc, defaultBaseName) { // {{{
    console.log("savePDF  called with ", defaultBaseName);
    let defaultName = defaultBaseName + ".pdf";
    let defaultPath = path.join(app.getPath('documents'), defaultName);

    let data = 
      await wc.printToPDF({
        printBackground: true,
        pageSize: "Letter",
        marginsType: 1, // no margin
      });

    let { canceled, filePath } = 
      await dialog.showSaveDialog({
        title: `Save Form ${defaultName}`,
        defaultPath: defaultPath,
        filters: [
          { name: 'PDF (*.pdf)', extensions: ['pdf', ] },
        ]
      })

    console.log("saveToPDF", canceled, filePath);

    if (! canceled) 
      await fsPromises.writeFile(filePath, data);

    return !canceled;
  } // }}}
}

