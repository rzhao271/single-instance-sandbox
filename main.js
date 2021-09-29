// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};

// The object to send from the second to the first instance
const obj = {
  a: 1,
  b: 'stri'
};

// The ack to send from the first instance to the second instance
const returnObj = {
  a: 2,
  c: 'fri'
};

// This event runs when the second instance got back an ack from the first instance.
// It must be registered before the call to app.requestSingleInstanceLock
app.on('first-instance-ack', (event, data) => {
  console.log('Received data from first instance');
  console.log(JSON.stringify(data));
  // Potential issue:
  // We need to setTimeout here, otherwise the cleanup does not proceed properly,
  // leading to the lockfile not being found upon attempting to run a
  // second instance for the second time
  // setTimeout(() => app.quit(), 200);
  // app.quit();
});

const gotLock = app.requestSingleInstanceLock();

let myWindow;
if (!gotLock) {
  console.log('We are the second instance');
} else {
  console.log('We are the first instance');
  // Potential issue:
  // There are a lot of fields in the callback here.
  // Is there any way to organize them?
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData, ackCallback) => {
    // event.preventDefault();
    console.log('Received data from second instance');
    console.log(JSON.stringify(additionalData));
    // Potential issue:
    // There is a breaking change here, since if the user doesn't call this new
    // callback, they are forced to wait for the timer on the Chromium side to kick in.
    // console.log('Sending data back to the second instance before timeout expires');
    // ackCallback();
    // ackCallback(returnObj);
  });

  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    myWindow = createWindow()
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
