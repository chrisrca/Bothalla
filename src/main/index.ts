import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { exec } from 'child_process';

let runBot = false;

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

  const defaultConfig = {
    "character": "Random",
    "duration": 8,
    "auto_stop": true,
    "auto_detect_auto_stop": false,
    "auto_stop_frequency": 5,
    "auto_stop_duration": 30,
    "bots": 2,
    "mute": false,
    "stealth": true,
    "mode_name": "Leveling up one character",
    "version": "3.5.23"
  };

  const configPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'bhbot.cfg');
  const legendsPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'legends.cfg');
  const bhbotPath = join(__dirname, '..', 'src', 'main', 'bhbot').replace(/\\out/g, '').replace(/\\app.asar/g, '');
  const installDepsCommand = `pip install -r ${join(bhbotPath, 'requirements.txt')}`
  
  if (!fs.existsSync(configPath) || !fs.existsSync(legendsPath)) {
    fs.mkdirSync(join(app.getPath('appData'), '..', 'Local', 'BHBot'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig), { encoding: 'utf-8' });
    fs.writeFileSync(legendsPath, '');
  }

  exec(installDepsCommand, { cwd: bhbotPath }, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing dependencies: ${error}`);
        console.error(stderr);  // This will print the error output from pip
        return;
    }
    console.log('Dependencies installed:', stdout);
    console.log('Installation errors (if any):', stderr);

    createWindow()

    // Execute the command to run the Python script
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
  
    ipcMain.on('request-urls', async (event) => {
      try {
        const urls = await fetchAndProcessHTML('https://www.brawlhalla.com/legends');
        if (urls) {
          let newNamesToAdd: string[] = [];
      
          if (fs.existsSync(legendsPath)) {
            const configFile = fs.readFileSync(legendsPath, { encoding: 'utf-8' });
            for (let i = 0; i < urls.alts.length; i++) {
              if (!configFile.includes(urls.alts[i].toLowerCase())) {
                newNamesToAdd.push(urls.alts[i].toLowerCase());
              }
            }
        
            if (newNamesToAdd.length > 0) {
              const jsonToWrite = JSON.stringify(newNamesToAdd, null, 2); // Convert array to JSON string formatted nicely
              fs.writeFileSync(legendsPath, jsonToWrite, { encoding: 'utf-8' });
            }
          }
          event.reply('response-urls', urls.urls, urls.names, urls.alts);
        } else {
          event.reply('response-urls', [], [], []);
        }
      } catch {
        event.reply('response-urls', [], [], []);
      }
    });

    ipcMain.on('request-selected', async (event) => {
      try {
        const reverseFormatCharacterName = (formattedName: string): string => {
          return formattedName.split(' ').map((word, index) => {
              if (index !== 0) {
                  return word.charAt(0).toUpperCase() + word.slice(1);
              }
              return word;
          }).join('');
        };

        const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
        const config = JSON.parse(configFile);
        event.reply('response-selected', reverseFormatCharacterName(config.character));
      } catch {
        event.reply('response-selected', "");
      }
    });
    
    ipcMain.on('legend', async (_event, newCharacter: string) => {
      try {
        const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
        const config = JSON.parse(configFile);
        config.character = newCharacter.charAt(0).toUpperCase() + newCharacter.slice(1).toLowerCase();;
        const formattedJson = JSON.stringify(config, null, 0)
          .replace(/:/g, ': ')
          .replace(/,/g, ', ');

          fs.writeFileSync(configPath, formattedJson, { encoding: 'utf-8' });
      } catch {}
    });
  
    ipcMain.on('toggle-bot', async () => {
    
      const runPythonScriptCommand = `python ${join(bhbotPath, 'main.pyw')}`;

      if (!runBot) {
        runBot = true
        exec(runPythonScriptCommand, { cwd: bhbotPath }, (error, stdout, stderr) => {
          if (error) {
              console.error(`Error running Python script: ${error}`);
              console.error(stderr);  // Print errors from Python script execution
              return;
          }
          console.log('Python script output:', stdout);
          console.error('Python script errors:', stderr);  
        });
      } else {
        runBot = false
      }
    });
    
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const fetchAndProcessHTML = async (url: string) => {
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


const extractDataSources = (html: string): { urls: string[], names: string[], alts: string[] } => {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const names: string[] = [];
  const alts: string[] = [];
  $('img').each((_i, elem) => {
    const parentLink = $(elem).closest('a');
    const href = parentLink.attr('href');
    const src = $(elem).attr('src');
    const alt = $(elem).attr('alt') || '';

    if (href?.startsWith('/legends/')) {
      if (src) {
        urls.push(src);
        const name = href.slice('/legends/'.length);
        names.push(name);
        alts.push(alt);
      }
    }
  });

  return { urls, names, alts };
};

function parseCharacterData(data: string) {
  const regex = /<([^>]+) \(lvl: (\d+), xp: (\d+), unlocked: (True|False)\)>/;
  const [, name, level, xp] = regex.exec(data) || [];
  return name ? {
      name: name.trim(),
      level: parseInt(level),
      xp: parseInt(xp)
  } : null;
}

function fetchLogs() {
  if (runBot) {
    axios.get('http://127.0.0.1:30000/get_logs')
    .then(response => {
      response.data.forEach(item => {
        switch (item) {
          case 'waiting_for_bh_window':
            console.log("Waiting for Brawlhalla to load");
            break;
          case 'found_bh':
            console.log("Found Brawlhalla");
            break;
          case 'move_offscreen':
            console.log("Hid Brawlhalla");
            break;
          case 'not_in_menu':
            console.log("Waiting for menu");
            break;
          case 'collecting_character_data':
            console.log("Reading character levels");
            break;
          case 'initialized':
            console.log("Character data loaded");
            break;
          default:
            if (item.startsWith("<") && item.endsWith(">")) {
              const parsedData = parseCharacterData(item);
              console.log("Parsed Character Data: ", parsedData);
            } else {
              console.log(item)
            }
        }
      });
    })
    .catch(_error => {});
  }
}

setInterval(fetchLogs, 100);