
const { contextBridge, ipcRenderer } = require('electron');
// const electron  = require('electron');
// const remote = require('@electron/remote');

// window.path = {
//   join : path.join,
// };


console.log("preload")

contextBridge.exposeInMainWorld('electronAPI', {
    saveToPDF: (defaultBaseName) => ipcRenderer.send('saveToPDF', defaultBaseName)
})

// window.electron = {
//   ipcRenderer : electron.ipcRenderer,
//   // shell : {
//   //   openExternal : electron.shell.openExternal,
//   // },
//   remote : {
//     app : {
//       getPath : remote.app.getPath,
//     },
//     dialog: {
//       showSaveDialog : remote.dialog.showSaveDialog,
//     },
//     // for print-preview
//     getCurrentWebContents : remote.getCurrentWebContents,
//   },
// };

