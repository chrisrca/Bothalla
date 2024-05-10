import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { exec } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let runBot = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
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
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
    }
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
    "version": "1.0"
  };

  const configPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'bhbot.cfg');
  const legendsPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'legends.cfg');
  const statsPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'stats.cfg');
  const bhbotPath = join(__dirname, '..', 'src', 'main', 'bhbot').replace(/\\out/g, '').replace(/\\app.asar/g, '');
  const installDepsCommand = `pip install -r ${join(bhbotPath, 'requirements.txt')}`
  
  if (!fs.existsSync(configPath) || !fs.existsSync(legendsPath)) {
    fs.mkdirSync(join(app.getPath('appData'), '..', 'Local', 'BHBot'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig), { encoding: 'utf-8' });
    fs.writeFileSync(legendsPath, '');
    fs.writeFileSync(statsPath, '');
  }

  exec(installDepsCommand, { cwd: bhbotPath }, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing dependencies: ${error}`);
        console.error(stderr);  // This will print the error output from pip
        return;
    }
    console.log('Dependencies installed:', stdout);
    console.log('Installation errors (if any):', stderr);

    console.log(getProfilePictureAndName())

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

      if (!runBot && mainWindow) {
        runBot = true
        mainWindow.webContents.send('log-message', { text: "Initializing Bot", color: 'yellow' });
        exec(runPythonScriptCommand, { cwd: bhbotPath }, (error, stdout, stderr) => {
          if (error) {
              console.error(`Error running Python script: ${error}`);
              console.error(stderr);  // Print errors from Python script execution
              return;
          }
          console.log('Python script output:', stdout);
          console.error('Python script errors:', stderr);  
        });
      } else if (mainWindow) {
        mainWindow.webContents.send('log-message', { text: "Disabling Bot", color: 'red' });
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
  const reverseFormatCharacterName = (formattedName: string): string => {
    return formattedName.split(' ').map((word, index) => {
        if (index !== 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');
  };

  if (runBot) {
    axios.get('http://127.0.0.1:30000/get_logs')
      .then(response => {
        response.data.forEach((item: string) => {
          console.log(item)
          let logMessage = { text: "null", color: 'white' };
          switch (item) {
            case 'waiting_for_bh_window':
              logMessage.text = "Waiting for Brawlhalla to load";
              logMessage.color = '#44B4CC';
              break;
            case 'found_bh':
              logMessage.text = "Found Brawlhalla";
              logMessage.color = '#0000FF';
              break;
            case 'move_offscreen':
              logMessage.text = "Hid Brawlhalla";
              logMessage.color = '#19D1D8';
              break;
            case 'not_in_menu':
              logMessage.text = "Waiting for menu";
              logMessage.color = '#81EC0D';
              break;
            case 'collecting_character_data':
              logMessage.text = "Loading Character data";
              logMessage.color = '#FF00FF';
              break;
            case 'initialized':
              logMessage.text = "Character data loaded";
              logMessage.color = '#FF0000';
              break;
            case `{'menu'}`:
              logMessage.text = "Navigating menu";
              logMessage.color = '#E5E5E5';
              break;
            case `{'lobby', 'menu'}`:
              logMessage.text = "Navigating lobby menu";
              logMessage.color = '#FFD93D';
              break;
            case `{'settings_open'}`:
              logMessage.text = "Navigating lobby settings";
              logMessage.color = '#19D1D8';
              break;
            case 'setting_lobby':
              logMessage.text = "Created lobby";
              logMessage.color = '#CCFF04';
              break;
            case 'loading':
              logMessage.text = "Loading game";
              logMessage.color = '#9933CC';
              break;
            case 'started_fighting':
              logMessage.text = "Started fighting";
              logMessage.color = '#FF6600';
              break;
            case 'ended_fighting':
              logMessage.text = "Ended fighting";
              logMessage.color = '#FFD93D';
              break;
            default:
              if (item.startsWith("<") && item.endsWith(">")) {
                const parsedData = parseCharacterData(item);
                if (parsedData) {
                  logMessage.text = "Loaded " + reverseFormatCharacterName(parsedData?.name);
                  logMessage.color = 'cyan';
                }
              }
              break;
          }
          if (mainWindow) {
            mainWindow.webContents.send('log-message', logMessage);
          }
        });
      })
      .catch(_error => {});
  }
}

setInterval(fetchLogs, 100);

function getProfilePictureAndName() {
  const content = fs.readFileSync("C:\\Program Files (x86)\\Steam\\config\\loginusers.vdf", 'utf8');
    const regex = /"PersonaName"\s*"([^"]+)"[^{}]*"MostRecent"\s*"1"/s;
    const match = regex.exec(content);

    if (match) {
        return match[1];  // Return the PersonaName of the most recent user
    } else {
        return null;  // Return null if no most recent user is found
    }
}
