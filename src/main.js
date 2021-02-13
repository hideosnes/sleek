// ########################################################################################################################
// FUNCTIONS
// ########################################################################################################################
function switchLanguage() {
  try {
    if(userData.get("language")) {
      var language = userData.get("language");
    } else {
      var language = app.getLocale().substr(0,2);
    }
    i18next
    .use(i18nextBackend)
    .init(i18nextOptions);
    i18next.changeLanguage(language, (error) => {
      if (error) return console.log("Error in switchLanguage():", error);
    });
    userData.set("language", language);
    return Promise.resolve("Success: Language set to: " + language);
  } catch (error) {
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "switchLanguage()", error])
    return Promise.reject("Error in switchLanguage(): " + error);
  }
}
function getFileContent(file) {
  return fs.readFileSync(file, {encoding: 'utf-8'}, function(err,data) { return data; });
}
function getCurrentFile() {
  try {
    let files = new Array;
    // in case somebody updates from a very old version where pathToFile was still in use
    if((!userData.get("files") || userData.get("files").length===0) && userData.get("pathToFile")) {
      files.push([1, userData.get("pathToFile")]);
    } else {
      files = userData.get("files");
    }
    // remove files that don't exist at the given path
    files = files.filter(function(file) { return fs.existsSync(file[1]) === true });
    // persist
    userData.set("files", files);
    // select the entry that is current
    const file = files.filter(function(file) { return file[0] === 1 });
    // return path
    if(file.length>0) return Promise.resolve(file[0][1])
    // return no path if there is no current file
    return Promise.resolve()
  } catch (error) {
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "getCurrentFile()", error])
    return Promise.reject("Error in getCurrentFile(): " + error);
  }
}
let fileWatcher;
const { app, BrowserWindow, nativeTheme, electron, ipcMain, session, Notification, dialog } = require("electron");
const { is } = require("electron-util");
const fs = require("fs");
const path = require("path");
const isMac = process.platform === "darwin";
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = require('./configs/i18next.config');
const Store = require("./configs/store.config.js");
const userData = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    dismissedNotifications: new Array,
    dismissedMessages: new Array,
    theme: null,
    matomoEvents: false,
    notifications: true,
    language: null,
    files: new Array,
    uid: null,
    filterDrawerWidth: "560px",
    useTextarea: false,
    filterDrawer: false,
  }
});
const appData = {
  version: app.getVersion(),
  development: is.development,
  languages: i18nextOptions.supportedLngs,
  path: __dirname
}
const createWindow = () => {
  let { width, height } = userData.get("windowBounds");
  const mainWindow = new BrowserWindow(
  {
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 600,
    simpleFullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      enableRemoteModule: false,
      worldSafeExecuteJavaScript:true,
      nodeIntegration: false,
      enableRemoteModule: true,
      spellcheck: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });
  // ########################################################################################################################
  // INITIAL CONFIGURATION
  // ########################################################################################################################
  // if language isn't set use locale setting
  if(userData.data.language) {
    var language = userData.data.language;
  } else {
    var language = app.getLocale().substr(0,2);
  }
  // if theme hasn't been set use the OS theme preference
  if(!userData.get("theme") && nativeTheme.shouldUseDarkColors) {
    userData.set("theme", "dark");
  } else {
    userData.set("theme", "light");
  }
  // ########################################################################################################################
  // MAINWINDOW CONFIGURATION
  // ########################################################################################################################
  // use ico on Windows and png on all other OS
  if (process.platform === "win32") {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.ico"));
  } else {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/icon.png"));
  }
  // show dev tools if in dev mode
  if (is.development) mainWindow.webContents.openDevTools()
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // open links in external browser
  mainWindow.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });
  // every 10 minutes sleek will reload renderer if app is not focused
  // important for notifications to show up if sleek is running for a long time in background
  let timerId = setInterval(() => {
    if(!mainWindow.isFocused()) {
      mainWindow.webContents.send("triggerFunction", "generateTodoData")
    }
  }, 600000);
  // ########################################################################################################################
  // MENU CONFIGURATION (https://dev.to/abulhasanlakhani/conditionally-appending-developer-tools-menuitem-to-an-existing-menu-in-electron-236k)
  // ########################################################################################################################
  // Modules to create application menu
  const Menu = require("electron").Menu;
  const menuTemplate = [
    {
      label: i18next.t("file"),
      submenu: [
        {
          label: i18next.t("openFile"),
          accelerator: "CmdOrCtrl+o",
          click: function (item, focusedWindow) {
            openFile();
          }
        },
        {
          label: i18next.t("createFile"),
          click: function (item, focusedWindow) {
            createFile();
          }
        },
        isMac ? {
          role: "quit",
          label: i18next.t("close")
        } : {
          role: "close",
          label: i18next.t("close")
        }
      ]
    },
    {
      label: i18next.t("edit"),
      submenu: [
      {
        label: i18next.t("settings"),
        accelerator: "CmdOrCtrl+,",
        click: function () {
          mainWindow.webContents.executeJavaScript("showContent(modalSettings)");
        }
      }]
    },
    {
      label: i18next.t("todos"),
      submenu: [
        {
          label: i18next.t("addTodo"),
          accelerator: "CmdOrCtrl+n",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "showForm")
          }
        },
        {
          label: i18next.t("find"),
          accelerator: "CmdOrCtrl+f",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("todoTableSearch.focus()");
          }
        },
        {
          label: i18next.t("archive"),
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "archiveTodos")
          }
        }
      ]
    },
    {
      label: i18next.t("view"),
      submenu: [
        {
          label: i18next.t("toggleFilter"),
          accelerator: "CmdOrCtrl+b",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "showFilterDrawer", ["toggle"])
          }
        },
        {
          label: i18next.t("resetFilters"),
          accelerator: "CmdOrCtrl+l",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "resetFilters")
          }
        },
        {
          label: i18next.t("toggleDarkMode"),
          accelerator: "CmdOrCtrl+d",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "setTheme", [true])
          }
        },
        {
          label: i18next.t("toggleCompletedTodos"),
          accelerator: "CmdOrCtrl+h",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "toggleCompletedTodos")
          }
        },
        {
          role: "reload",
          label: i18next.t("reload")
        }
      ]
    },
    {
      label: i18next.t("about"),
      submenu: [
        {
          label: i18next.t("help"),
          click: function () {
            mainWindow.webContents.executeJavaScript("showContent(modalHelp)");
          }
        },
        {
          label: i18next.t("sleekOnGithub"),
          click: () => {require("electron").shell.openExternal("https://github.com/ransome1/sleek")}
        },
        {
          role: "toggleDevTools",
          label: i18next.t("devTools")
        }
      ]
    }
  ];
  // Set menu to menuTemplate
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  // ########################################################################################################################
  // FUNCTIONS THAT NEED TO ACCESS MAINWINDOW
  // ########################################################################################################################
  function createFile() {
    dialog.showSaveDialog({
      title: i18next.t("windowTitleCreateFile"),
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: i18next.t("windowButtonCreateFile"),
      filters: [{
        name: i18next.t("windowFileformat"),
        extensions: ["txt", "md"]
      }],
      properties: ["openFile", "createDirectory"]
    }).then(file => {
      fs.writeFile(file.filePath, "", function (error) {
        if (!file.canceled) {
          console.log("Success: New todo.txt file created: " + file.filePath);
          mainWindow.webContents.send("changeFile", file.filePath)
        }
      });
    }).catch(error => {
      console.log("Error: " + error)
    });
  }
  function openFile() {
    dialog.showOpenDialog({
      title: i18next.t("selectFile"),
      defaultPath: path.join(app.getPath("home")),
      buttonLabel: i18next.t("windowButtonOpenFile"),
      filters: [{
        name: i18next.t("windowFileformat"),
        extensions: ["txt", "md"]
      }],
      properties: ["openFile"]
    }).then(file => {
      if (!file.canceled) {
        file = file.filePaths[0].toString();
        console.log("Success: Storage file updated by new path and filename: " + file);
        mainWindow.webContents.send("changeFile", file)
      }
    }).catch(err => {
        console.log("Error: " + err)
    });
  }
  function createNote() {
    dialog.showSaveDialog({
      title: i18next.t("windowTitleCreateFile"),
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: i18next.t("windowButtonCreateFile"),
      filters: [{
        name: i18next.t("windowFileformat"),
        extensions: ["md"]
      }],
      properties: ["openFile", "createDirectory"]
    }).then(file => {
      fs.writeFile(file.filePath, "", function (error) {
        if (!file.canceled) {
          console.log("Success: New todo.txt file created: " + file.filePath);
          mainWindow.webContents.send("changeFile", file.filePath)
        }
      });
    }).catch(error => {
      console.log("Error: " + error)
    });
  }
  // ########################################################################################################################
  // LISTEN TO REQUESTS FROM RENDERER CONTEXT
  // ########################################################################################################################
  // Send result back to renderer process
  ipcMain.on("getUserData", (event, args) => {
    getCurrentFile().then(response => {
      userData.data.file = response;
      mainWindow.webContents.send("getUserData", userData.data);
    }).catch(error => {
      console.log(error);
    });
  });
  // Send result back to renderer process
  ipcMain.on("getAppData", (event, args) => {
    mainWindow.webContents.send("getAppData", appData);
  });
  // Change language
  ipcMain.on("changeLanguage", (event, language) => {
    i18next
    .use(i18nextBackend)
    .init(i18nextOptions);
    i18next.changeLanguage(language, (error) => {
      if (error) return console.log("Error in i18next.changeLanguage():", error);
    });
    app.relaunch();
    app.exit();
  });
  // Write config to file
  ipcMain.on("setUserData", (event, args) => {
    userData.set(args[0], args[1]);
    getCurrentFile().then(response => {
      userData.data.file = response;
      mainWindow.webContents.send("getUserData", userData.data);
    }).catch(error => {
      console.log(error);
    });
  });
  // Write content to file
  ipcMain.on("writeToFile", (event, args) => {
    fs.writeFileSync(args[1], args[0], {encoding: 'utf-8'});
  });
  // Open or create file
  ipcMain.on("openOrCreateFile", (event, args) => {
    switch (args) {
      case "open":
        openFile();
        break;
      case "create":
        createFile();
        break;
      case "createNote":
        createNote();
        break;
    }
  });
  // Start the filewatcher
  ipcMain.on("startFileWatcher", (event, file) => {
    if (fs.existsSync(file)) {
      if(fileWatcher) fileWatcher.close();
      fileWatcher = fs.watch(file, (event, filename) => {
        console.log("Info: File has changed");
        // only update content if file still exists
        if (fs.existsSync(file)) {
          mainWindow.webContents.send("reloadContent", getFileContent(file))
        // start onboarding if file cannot be found anymore
        } else {
          mainWindow.webContents.send("triggerFunction", "showOnboarding", [true])
        }
      });
    }
  });
  // Send translations back to renderer process
  ipcMain.on("getTranslations", (event, args) => {
    mainWindow.webContents.send("sendTranslations", i18next.getDataByLanguage(userData.get("language")).translation)
  });
  // Check if file exists and send content to renderer process
  ipcMain.on("getFileContent", (event, file) => {
    // read fresh data from file
    mainWindow.webContents.send("getFileContent", getFileContent(file))
  });
  // Show a notification in OS UI
  ipcMain.on("showNotification", (event, config) => {
    config.icon = __dirname + "/../assets/icons/icon.png";
    // send it to UI
    const notification = new Notification(config);
    notification.show();
    // click on button in notification
    notification.addListener('click', () => {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Notification", "Click on notification"]);
      // bring mainWindow to foreground
      mainWindow.focus();
      // if another modal was open it needs to be closed first and then open the modal and fill it
      mainWindow.webContents.executeJavaScript("clearModal(); showForm(\"" + config.string + "\", false);");
    },{
      // remove event listener after it is clicked once
      once: true
    });
  });
};
// ########################################################################################################################
//
// ########################################################################################################################
app.on("ready", () => {
  switchLanguage().then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  createWindow();
  if (process.platform === 'win32') {
    app.setAppUserModelId("RobinAhle.sleektodomanager");
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  app.show();
});
