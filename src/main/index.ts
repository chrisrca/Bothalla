import { app, shell, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { exec } from 'child_process';

const statsPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'stats.cfg');
const legendStatsPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'legendStats.cfg');
let mainWindow: BrowserWindow | null = null;
let runBot = false;
let selectedLegend;
let stats = {
  "run_time": 0,
};

let lastUpdateTime = Date.now();

interface LegendStats {
  name: string;
  level: number;
  xp: number;
  playtime: number;
}

let legendStats: LegendStats[] = [];

function trayIcon() {
  const tray = new Tray(icon);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  tray.setToolTip('Bothalla');

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show Bothalla', click: function () {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Quit Bothalla', click: function () {
        app.quit();
      }
    }
  ]));
}

function createWindow(width = 250, height = 182.75) {
  mainWindow = new BrowserWindow({
    type: 'toolbar',
    width: width,
    height: height,
    show: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: false
    }
  });

  mainWindow.setResizable(false);
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      const iconPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'icon.png');
      fs.readFile(iconPath, (error, data) => {
        if (error) {
          mainWindow!.show();
          return;
        }
        const iconBase64 = `data:image/png;base64,${data.toString('base64')}`;
        mainWindow!.webContents.send('icon', iconBase64);
        mainWindow!.show();
      });
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  ipcMain.on('minimize-app', () => mainWindow?.minimize());
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {
        console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });
    globalShortcut.register("F5", () => {
        console.log("F5 is pressed: Shortcut Disabled");
    });
  });

  app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
    globalShortcut.unregister('CommandOrControl+Shift+I');
  });
  
  trayIcon()
  createWindow()

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
  const bhbotPath = join(__dirname, '..', 'src', 'main', 'bhbot').replace(/\\out/g, '').replace(/\\app.asar/g, '');
  const installDepsCommand = `pip install -r ${join(bhbotPath, 'requirements.txt')}`
  const urls = await fetchAndProcessHTML('https://www.brawlhalla.com/legends');
  
  if (!fs.existsSync(configPath) || !fs.existsSync(legendsPath) || !fs.existsSync(statsPath) || !fs.existsSync(legendStatsPath)) {
    fs.mkdirSync(join(app.getPath('appData'), '..', 'Local', 'BHBot'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig), { encoding: 'utf-8' });
    fs.writeFileSync(legendsPath, '');
    fs.writeFileSync(statsPath, JSON.stringify(stats), { encoding: 'utf-8' });
    fs.writeFileSync(legendStatsPath, JSON.stringify(legendStats), { encoding: 'utf-8' });
  } else {
    const data = fs.readFileSync(legendStatsPath, { encoding: 'utf-8' });
    if (data != '') {
      legendStats = JSON.parse(data);
    }
  }

  try {
    const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
    const config = JSON.parse(configFile);
    config.mode_name = "Leveling up one character";
    const formattedJson = JSON.stringify(config, null, 0)
      .replace(/:/g, ': ')
      .replace(/,/g, ', ');

      fs.writeFileSync(configPath, formattedJson, { encoding: 'utf-8' });
  } catch {}

  loadStats()

  exec(installDepsCommand, { cwd: bhbotPath }, (error) => {
    if (error) {
        if (mainWindow) { 
          mainWindow.webContents.send('log-message', { text: "Error Installing python dependencies.", color: 'red' });
          mainWindow.webContents.send('log-message', { text: "Please make sure Python 3.11.5 is installed.", color: 'red' });
        }
        return;
    }
    let intervalId;
    if (mainWindow) {
      mainWindow.destroy();
      
      intervalId = setInterval(() => {
        if (mainWindow) {
          mainWindow.webContents.send('done-loading', true);
          const iconPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'icon.png');
          fs.readFile(iconPath, (error, data) => {
            if (error) {
                mainWindow!.show();
                return;
            }
            const iconBase64 = `data:image/png;base64,${data.toString('base64')}`;
            mainWindow!.show();
            mainWindow!.webContents.send('icon', iconBase64);
          });
        }
      }, 100);
    
      createWindow(1150, 690);
    }

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    ipcMain.on('request-name', async (event) => {
      clearInterval(intervalId);
      event.reply('response-request-name', getProfilePictureAndName());
    });

    ipcMain.on('request-time', async (event) => {
      event.reply('response-time', stats.run_time);
    });

    ipcMain.on('set-not-first-time', async (_event) => {
      if (stats.run_time == 0) {
        stats.run_time = 1
        saveStats()
      }
    });
  
    ipcMain.on('request-urls', async (event) => {
      try {
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
              const jsonToWrite = JSON.stringify(newNamesToAdd, null, 2);
              fs.writeFileSync(legendsPath, jsonToWrite, { encoding: 'utf-8' });
            }
          }

          event.reply('response-urls', urls.urls, urls.alts, urls.imgs);
        } else {
          event.reply('response-urls', [], [], [], []);
        }
      } catch {
        event.reply('response-urls', [], [], [], []);
      }
    });

    ipcMain.on('request-selected', async (event) => {
      try {
        const formatSelected = (formattedName: string): string => {
          return formattedName.split(' ').map((word, index) => {
              if (index !== 0) {
                  return word.charAt(0).toUpperCase() + word.slice(1);
              }
              return word;
          }).join(' ');
        };

        const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
        const config = JSON.parse(configFile);
        selectedLegend = config.character
        event.reply('response-selected', formatSelected(config.character));
      } catch {
        event.reply('response-selected', "");
      }
    });
    
    ipcMain.on('legend', async (_event, newCharacter: string) => {
      try {
        const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
        const config = JSON.parse(configFile);
        config.character = newCharacter.charAt(0).toUpperCase() + newCharacter.slice(1).toLowerCase();;
        selectedLegend = config.character
        const formattedJson = JSON.stringify(config, null, 0)
          .replace(/:/g, ': ')
          .replace(/,/g, ', ');

          fs.writeFileSync(configPath, formattedJson, { encoding: 'utf-8' });
      } catch {}
    });

    ipcMain.on('mode', async (_event, mode: string) => {
      try {
        const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
        const config = JSON.parse(configFile);
        config.mode_name = mode;
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
        exec(runPythonScriptCommand, { cwd: bhbotPath }, (error) => {
          if (error) {
              runBot = false
              return;
          }
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

app.on('before-quit', () => {
  updateRunTime();
  saveStats();
});

let isLoading = true;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !isLoading) {
    app.quit()
  } else {
    isLoading = false
  }
})

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
              const iconPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'icon.png');
              fs.readFile(iconPath, (error, data) => {
                if (error) {
                    return;
                }
                const iconBase64 = `data:image/png;base64,${data.toString('base64')}`;
                mainWindow!.show();
                mainWindow!.webContents.send('icon', iconBase64);
              });
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
                if (parsedData && parsedData.name) {
                    const existingIndex = legendStats.findIndex(stat => stat.name === reverseFormatCharacterName(parsedData.name));
                    const data: LegendStats = {
                        name: reverseFormatCharacterName(parsedData.name),
                        level: parsedData.level,
                        xp: parsedData.xp,
                        playtime: existingIndex !== -1 ? legendStats[existingIndex].playtime : 0 
                    };
                    
                    if (existingIndex !== -1) {
                        legendStats[existingIndex] = data;
                    } else {
                        legendStats.push(data);
                    }
                    fs.writeFileSync(legendStatsPath, JSON.stringify(legendStats), { encoding: 'utf-8' });
                    logMessage.text = "Loaded " + reverseFormatCharacterName(parsedData.name) + ` (lvl: ${parsedData.level}, xp: ${parsedData.xp})`;
                    logMessage.color = 'cyan';
                }
              } else if (item.includes("pick_char")) {
                  const regex = /<(.+?) \(lvl: (\d+), xp: (\d+), unlocked: (True|False)\)>/;
                  const matches = item.match(regex);
                  if (matches) {
                    const name = matches[1];
                    const level = parseInt(matches[2], 10);
                    const xp = parseInt(matches[3], 10);

                    const existingIndex = legendStats.findIndex(stat => stat.name === name);

                    if (existingIndex !== -1) {
                        legendStats[existingIndex].level = level;
                        legendStats[existingIndex].xp = xp;
                    }

                    if (selectedLegend == "Random") {
                      logMessage.text = "Picked Random";
                    } else {
                      logMessage.text = "Picked " + name + ` (lvl: ${level}, xp: ${xp})`;
                    }
                    logMessage.color = 'green';
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
        return match[1];
    } else {
        return null;
    }
}

function loadStats() {
  if (fs.existsSync(statsPath)) {
    const data = fs.readFileSync(statsPath);
    stats = JSON.parse(data.toString());
  }
}

function saveStats() {
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  fs.writeFileSync(legendStatsPath, JSON.stringify(legendStats), { encoding: 'utf-8' });
}

function updateRunTime() {
  if (runBot) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastUpdateTime;
    stats.run_time += elapsedTime;
    const configPath = join(app.getPath('appData'), '..', 'Local', 'BHBot', 'bhbot.cfg');
    try {
      const formatSelected = (formattedName: string): string => {
        return formattedName.split(' ').map((word, index) => {
            if (index !== 0) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        }).join(' ');
      };

      const configFile = fs.readFileSync(configPath, { encoding: 'utf-8' });
      const config = JSON.parse(configFile);
      const legend = legendStats.find(stat => stat.name === formatSelected(config.character));
      if (legend) {
        legend.playtime += 60000;
        fs.writeFileSync(legendStatsPath, JSON.stringify(legendStats), { encoding: 'utf-8' });
      }

    } catch {}
    saveStats();
  }
  lastUpdateTime = Date.now();
}

function setRunTime() {
  if (mainWindow) {
    mainWindow.webContents.send('time-message', ((stats.run_time / 3600000).toFixed(0)));
    if (legendStats.length != 0) {
      mainWindow.webContents.send('legend-stats', (legendStats));
    }
  }
}

setInterval(setRunTime, 1000);
setInterval(updateRunTime, 60000);

const fetchAndProcessHTML = async (url: string) => {
  const simplifyImageUrl = (url) => {
    const parts = url.split('.png');
    return `${parts[0]}.png`;
  };

  const extractDataSources = async (html: string): Promise<{ urls: string[]; names: string[]; alts: string[]; imgs: string[]}> => {
    const $ = cheerio.load(html);
    const urls: string[] = [];
    const names: string[] = [];
    const alts: string[] = [];
    const imgs: string[] = [];

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

    for (let i = 0; i < alts.length; i++) {
      try {
        const response = await axios.get("https://www.brawlhalla.com/legends/" + names[i].replace(/ /g, "_"));
        const htmlContent = response.data;
        const $page = cheerio.load(htmlContent);
        const imageElement = $page(`img[alt="${alts[i]} Splash Art"]`);
        const imgHref = imageElement.attr('src');
        imgs.push(simplifyImageUrl(imgHref));
      } catch {
        continue;
      }
    }

    return { urls, names, alts, imgs };
  };

  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const data = await extractDataSources(htmlContent);
    return data;
  } catch (error) {
    return null;
  }
};
