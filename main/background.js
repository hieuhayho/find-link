import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
const {net} = require('electron');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1280,
    height: 720,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('find-url', (event, arg) => {
  let urlRedirect = '';
  try {
    const request = net.request({url: arg.url, redirect: 'manual'});
    request.on('error', (error) => {
      try {
        event.sender.send('find-url', error !== undefined ? error.message : '');
      } catch (e) {
        console.log(e);
      }
    });
    request.on('error', (error) => {
      try {
        event.sender.send('find-url', error !== undefined ? error.message : '');
      } catch (e) {
        console.log(e);
      }
    });
    request.on('response', (response) => {
      let data = "";
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          response['data'] = data;
          response['redirectURL'] = urlRedirect;
          event.sender.send('find-url', JSON.stringify(response));
        } catch (e) {
          console.log(e);
        }
      })
    });
    request.on('redirect', (statusCode, method, redirectURL, responseHeaders) => {
      urlRedirect = redirectURL;
      request.followRedirect();
    });
    request.end();
  } catch (e) {
    event.sender.send('find-url', e !== undefined ? e.message : '');
  }
});

