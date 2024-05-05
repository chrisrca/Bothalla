import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { exec } from 'child_process';

let serverPort = "";

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

  const bhbotPath = join(__dirname, '..', 'src', 'main', 'bhbot').replace(/\\out/g, '');
  const installDepsCommand = `pip install -r ${join(bhbotPath, 'requirements.txt')}`
  
  exec(installDepsCommand, { cwd: bhbotPath }, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing dependencies: ${error}`);
        console.error(stderr);  // This will print the error output from pip
        return;
    }
    console.log('Dependencies installed:', stdout);
    console.log('Installation errors (if any):', stderr);

    // Command to run the Python script
    const runPythonScriptCommand = `python ${join(bhbotPath, 'main.pyw')}`;

    // Execute the command to run the Python script
    exec(runPythonScriptCommand, { cwd: bhbotPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running Python script: ${error}`);
            console.error(stderr);  // Print errors from Python script execution
            return;
        }
        console.log('Python script output:', stdout);
        console.error('Python script errors:', stderr);


        
    });
  });

  let configWatcher = fs.watch('.//src//main//flask.cfg', (eventType, filename) => {
    if (eventType === 'change') {
      console.log(`${filename} has changed, processing new configuration...`);
      fs.readFile('.//src//main//flask.cfg', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the configuration file:', err);
            return;
        }
        const match = data.match(/PORT=(\d+)/);
        if (match && match[1]) {
            serverPort = match[1];
        } else {
            console.error('Port configuration not found or invalid in flask.cfg');
        }
      }); 
      configWatcher.close();
    }
  });

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('request-urls', async (event) => {
    const urls = await fetchAndProcessHTML('https://brawlhalla.fandom.com/wiki/Brawlhalla_Wiki');
    event.reply('response-urls', urls);
  });

  ipcMain.on('toggle-bot', async () => {
    axios.post(`http://127.0.0.1:${serverPort}/toggle_bot`)
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error));
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

