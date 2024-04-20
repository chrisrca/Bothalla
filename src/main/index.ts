import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios';
import cheerio from 'cheerio';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1150,
    height: 690,
    show: false,
    frame:false, 
    transparent:true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.setResizable(false);

  ipcMain.on('minimize-app', () => {
    mainWindow.minimize();
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('request-urls', async (event) => {
    const urls = await fetchAndProcessHTML('https://brawlhalla.fandom.com/wiki/Brawlhalla_Wiki');
    console.log(urls);
    event.reply('response-urls', urls);
  });

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const fetchAndProcessHTML = async (url) => {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const urls = extractDataSources(htmlContent);
    return urls;
  } catch (error) {
    console.error('Error fetching HTML content:', error);
    return null;
  }
};

const extractDataSources = (html) => {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('img').each((_i, elem) => {
    const src = $(elem).attr('data-src');
    if (src && src.includes('Portrait_')) {
      const pos = src.indexOf('.png');
      if (pos !== -1) {
        urls.push(src.substring(0, pos + 4));
      } else {
        urls.push(src);
      }
    }
  });
  return urls;
};

