var openApps = {};
var topZ = 10;
var wallpaperIndex = 0;

var wallpaperFilters = [
  "none",
  "sepia(60%) saturate(150%)",
  "hue-rotate(90deg)",
  "grayscale(70%)"
];

// ---------- clock ----------
function updateClock() {
  var now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

// ---------- start menu ----------
var startBtn = document.getElementById("start-btn");
var startMenu = document.getElementById("start-menu");

startBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  startMenu.classList.toggle("open");
});

document.addEventListener("click", function () {
  startMenu.classList.remove("open");
});

var menuItems = document.querySelectorAll(".sm-item");
for (var i = 0; i < menuItems.length; i++) {
  menuItems[i].addEventListener("click", function (e) {
    e.stopPropagation();
    var app = this.dataset.app;
    startMenu.classList.remove("open");
    if (app === "lock") {
      showLockScreen();
    } else {
      openApp(app);
    }
  });
}

var lockScreen = document.getElementById("lock-screen");

function showLockScreen() {
  lockScreen.classList.remove("hidden");
}

lockScreen.addEventListener("click", function () {
  lockScreen.classList.add("hidden");
});

var cellWidth = 100;
var cellHeight = 110;
var gridStartX = 20;
var gridStartY = 20;
var iconGrid = {}; 

function placeIcon(icon, col, row) {
  icon.style.left = gridStartX + col * cellWidth + "px";
  icon.style.top = gridStartY + row * cellHeight + "px";
  icon.dataset.col = col;
  icon.dataset.row = row;
  iconGrid[col + "," + row] = icon;
}

var icons = document.querySelectorAll(".icon");
for (var i = 0; i < icons.length; i++) {
  var col = parseInt(icons[i].dataset.col, 10);
  var row = parseInt(icons[i].dataset.row, 10);
  placeIcon(icons[i], col, row);

  icons[i].addEventListener("dblclick", function () {
    openApp(this.dataset.app);
  });
  makeIconDraggable(icons[i]);
}

function fileRow(name) {
  return (
    '<div class="file-row">' +
    '<svg viewBox="0 0 24 24" width="18" height="18">' +
    '<rect x="4" y="2" width="14" height="20" fill="#fff" stroke="#000" stroke-width="1.5"/>' +
    '<line x1="7" y1="7" x2="15" y2="7" stroke="#999" stroke-width="1.2"/>' +
    '<line x1="7" y1="11" x2="15" y2="11" stroke="#999" stroke-width="1.2"/>' +
    "</svg>" +
    "<span>" + name + "</span>" +
    "</div>"
  );
}

function getAppInfo(app) {
  if (app === "about") {
    return {
      title: "My Computer",
      width: 340,
      height: 260,
      body:
        '<div><span class="tag">v1.0</span><span class="tag">MlinuxsOS</span></div>' +
        '<div class="kv">' +
        "<b>OS</b><span>MlinuxsOS</span>" +
        "<b>Built with</b><span>HTML, CSS, JS</span>" +
        "<b>Made by</b><span>me!</span>" +
        "</div>" +
        "<p>A tiny desktop that runs right in your browser. Drag the icons and windows around and try the terminal.</p>"
    };
  }
  if (app === "notes") {
    return {
      title: "Notepad",
      width: 320,
      height: 240,
      body:
        '<textarea class="note">Welcome to Notepad.\nType whatever you want here.</textarea>'
    };
  }
  if (app === "files") {
    return {
      title: "My Documents",
      width: 320,
      height: 260,
      body:
        fileRow("README.md") +
        fileRow("devlog-01.txt") +
        fileRow("devlog-02.txt") +
        fileRow("devlog-03.txt")
    };
  }
  if (app === "bin") {
    return {
      title: "Recycle Bin",
      width: 300,
      height: 180,
      body: "<p>The recycle bin is empty.</p>"
    };
  }
  if (app === "settings") {
    return {
      title: "Settings",
      width: 300,
      height: 200,
      body:
        '<div class="setting-row"><button id="wallpaper-btn">Change wallpaper</button></div>' +
        "<p>More settings coming soon.</p>"
    };
  }
  if (app === "browser") {
    return {
      title: "Browser",
      width: 420,
      height: 320,
      body:
        '<div class="browser-bar">' +
        '<input type="text" id="browser-url" placeholder="Type a website and press Enter">' +
        "</div>" +
        '<iframe id="browser-frame" src="about:blank"></iframe>' +
        '<p class="browser-hint">Some sites won\'t allow themselves to be shown here, that\'s normal.</p>'
    };
  }
  if (app === "terminal") {
    return {
      title: "Terminal",
      width: 400,
      height: 260,
      body:
        '<div class="terminal" id="terminal-output">' +
        '<div class="terminal-line">MlinuxsOS terminal - type help</div>' +
        "</div>"
    };
  }
}

function openApp(app) {
  if (openApps[app]) {
    openApps[app].window.classList.remove("hidden");
    focusWindow(openApps[app].window);
    return openApps[app].window;
  }

  var info = getAppInfo(app);
  var win = document.createElement("div");
  win.className = "window";
  win.style.width = info.width + "px";
  win.style.height = info.height + "px";
  win.style.left = 80 + Object.keys(openApps).length * 25 + "px";
  win.style.top = 60 + Object.keys(openApps).length * 25 + "px";

  win.innerHTML =
    '<div class="titlebar">' +
    '<span class="title-text">' + info.title + "</span>" +
    '<div class="win-btn min">_</div>' +
    '<div class="win-btn max">□</div>' +
    '<div class="win-btn close">×</div>' +
    "</div>" +
    '<div class="window-body">' + info.body + "</div>" +
    '<div class="resize-handle"></div>';

  document.getElementById("desktop").appendChild(win);

  var chip = document.createElement("div");
  chip.className = "task-chip";
  chip.textContent = info.title;
  chip.addEventListener("click", function () {
    if (win.classList.contains("hidden")) {
      win.classList.remove("hidden");
      focusWindow(win);
    } else {
      win.classList.add("hidden");
    }
  });
  document.getElementById("taskbar-apps").appendChild(chip);

  openApps[app] = { window: win, chip: chip };

  // close button
  win.querySelector(".win-btn.close").addEventListener("click", function () {
    win.remove();
    chip.remove();
    delete openApps[app];
  });

  // minimize button
  win.querySelector(".win-btn.min").addEventListener("click", function () {
    win.classList.add("hidden");
  });

  // maximize button
  var savedSize = null;
  win.querySelector(".win-btn.max").addEventListener("click", function () {
    if (!savedSize) {
      savedSize = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height
      };
      win.style.left = "0px";
      win.style.top = "0px";
      win.style.width = "100%";
      win.style.height = "100%";
    } else {
      win.style.left = savedSize.left;
      win.style.top = savedSize.top;
      win.style.width = savedSize.width;
      win.style.height = savedSize.height;
      savedSize = null;
    }
  });

  win.addEventListener("mousedown", function () {
    focusWindow(win);
  });

  makeWindowDraggable(win);
  makeWindowResizable(win);
  focusWindow(win);

  // extra setup for special apps
  if (app === "terminal") {
    setupTerminal(win.querySelector(".window-body"));
  }
  if (app === "settings") {
    win.querySelector("#wallpaper-btn").addEventListener("click", changeWallpaper);
  }
  if (app === "browser") {
    setupBrowser(win.querySelector(".window-body"));
  }

  return win;
}

function focusWindow(win) {
  var allWindows = document.querySelectorAll(".window");
  for (var i = 0; i < allWindows.length; i++) {
    allWindows[i].style.zIndex = 1;
  }
  topZ = topZ + 1;
  win.style.zIndex = topZ;
}

// ---------- dragging windows ----------
function makeWindowDraggable(win) {
  var bar = win.querySelector(".titlebar");
  var isDragging = false;
  var startX, startY, startLeft, startTop;

  bar.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("win-btn")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    win.style.left = startLeft + dx + "px";
    win.style.top = startTop + dy + "px";
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
}

// ---------- resizing windows ----------
function makeWindowResizable(win) {
  var handle = win.querySelector(".resize-handle");
  var isResizing = false;
  var startX, startY, startWidth, startHeight;

  handle.addEventListener("mousedown", function (e) {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;
    e.stopPropagation();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;
    var newWidth = startWidth + (e.clientX - startX);
    var newHeight = startHeight + (e.clientY - startY);
    win.style.width = Math.max(250, newWidth) + "px";
    win.style.height = Math.max(150, newHeight) + "px";
  });

  document.addEventListener("mouseup", function () {
    isResizing = false;
  });
}

function makeIconDraggable(icon) {
  var isDragging = false;
  var startX, startY, startLeft, startTop;

  icon.addEventListener("mousedown", function (e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = icon.offsetLeft;
    startTop = icon.offsetTop;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    icon.style.left = startLeft + dx + "px";
    icon.style.top = startTop + dy + "px";
  });

  document.addEventListener("mouseup", function () {
    if (!isDragging) return;
    isDragging = false;

    var newCol = Math.round((icon.offsetLeft - gridStartX) / cellWidth);
    var newRow = Math.round((icon.offsetTop - gridStartY) / cellHeight);
    if (newCol < 0) newCol = 0;
    if (newRow < 0) newRow = 0;

    var newKey = newCol + "," + newRow;
    var oldKey = icon.dataset.col + "," + icon.dataset.row;

    if (iconGrid[newKey] && iconGrid[newKey] !== icon) {
      // that slot is already taken, so snap back to where it was
      placeIcon(icon, parseInt(icon.dataset.col, 10), parseInt(icon.dataset.row, 10));
    } else {
      delete iconGrid[oldKey];
      placeIcon(icon, newCol, newRow);
    }
  });
}

function changeWallpaper() {
  wallpaperIndex = (wallpaperIndex + 1) % wallpaperFilters.length;
  document.getElementById("desktop").style.filter = wallpaperFilters[wallpaperIndex];
}

function setupBrowser(body) {
  var input = body.querySelector("#browser-url");
  var frame = body.querySelector("#browser-frame");

  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var url = input.value.trim();
    if (url === "") return;
    if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
      url = "https://" + url;
    }
    frame.src = url;
  });
}

function setupTerminal(body) {
  var output = body.querySelector("#terminal-output");
  var row = document.createElement("div");
  row.className = "terminal-input-row";
  row.innerHTML =
    '<span class="prompt">guest@mlinuxsos:~$</span>' +
    '<input class="terminal-input" autocomplete="off">';

  output.appendChild(row);
  var input = row.querySelector("input");

  var history = [];
  var historyPos = -1;

  function printLine(text) {
    var line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    output.insertBefore(line, row);
    output.scrollTop = output.scrollHeight;
  }

  function runCommand(text) {
    if (text === "help") {
      printLine("commands: help, about, date, whoami, ls, pwd, neofetch, theme, clear");
    } else if (text === "about") {
      printLine("MlinuxsOS - a simple browser desktop.");
    } else if (text === "date") {
      printLine(new Date().toString());
    } else if (text === "whoami") {
      printLine("guest");
    } else if (text === "pwd") {
      printLine("/home/guest");
    } else if (text === "ls") {
      printLine("README.md  devlog-01.txt  devlog-02.txt  devlog-03.txt");
    } else if (text === "neofetch") {
      printLine("OS: MlinuxsOS");
      printLine("Shell: blockterm");
      printLine("Window Manager: drag-n-drop");
      printLine("Resolution: " + window.innerWidth + "x" + window.innerHeight);
    } else if (text === "theme") {
      changeWallpaper();
      printLine("wallpaper changed");
    } else if (text === "clear") {
      output.innerHTML = "";
    } else if (text === "") {
    } else {
      printLine(text + ": command not found");
    }
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var text = input.value.trim();
      printLine("guest@mlinuxsos:~$ " + text);
      if (text !== "") {
        history.push(text);
      }
      historyPos = history.length;
      input.value = "";
      runCommand(text);
    } else if (e.key === "ArrowUp") {
      if (historyPos > 0) {
        historyPos = historyPos - 1;
        input.value = history[historyPos];
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (historyPos < history.length - 1) {
        historyPos = historyPos + 1;
        input.value = history[historyPos];
      } else {
        historyPos = history.length;
        input.value = "";
      }
      e.preventDefault();
    }
  });

  output.addEventListener("mousedown", function () {
    setTimeout(function () {
      input.focus();
    }, 0);
  });
}

// need to fix
function centerWindow(win) {
  var desktop = document.getElementById("desktop");
  var left = (desktop.clientWidth - win.offsetWidth) / 2;
  var top = (desktop.clientHeight - win.offsetHeight) / 2;
  win.style.left = left + "px";
  win.style.top = top + "px";
}

var startupWindow = openApp("about");
centerWindow(startupWindow);