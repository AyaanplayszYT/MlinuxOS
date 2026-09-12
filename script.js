var openApps = {};

function updateClock() {
  var now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

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
    startMenu.classList.remove("open");
    openApp(this.dataset.app);
  });
}

var cellWidth = 90;
var cellHeight = 90;
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
      // spot taken, snap back
      placeIcon(icon, parseInt(icon.dataset.col, 10), parseInt(icon.dataset.row, 10));
    } else {
      delete iconGrid[oldKey];
      placeIcon(icon, newCol, newRow);
    }
  });
}

function getAppInfo(app) {
  if (app === "about") {
    return {
      title: "My Computer",
      body: "<p>MlinuxOS</p>"
    };
  }
  if (app === "notes") {
    return {
      title: "Notepad",
      body: '<textarea class="note">Type here...</textarea>'
    };
  }
  if (app === "terminal") {
    return {
      title: "Terminal",
      body:
        '<div class="terminal" id="terminal-output">' +
        '<div class="terminal-line">type help</div>' +
        "</div>"
    };
  }
  if (app === "files") {
    return {
      title: "Project Structure",
      body:
        '<div class="file-row">index.html</div>' +
        '<div class="file-row">style.css</div>' +
        '<div class="file-row">script.js</div>' +
        '<div class="file-row">README.md</div>'
    };
  }
}

function openApp(app) {
  if (openApps[app]) {
    openApps[app].window.classList.remove("hidden");
    return;
  }

  var info = getAppInfo(app);
  var win = document.createElement("div");
  win.className = "window";
  win.style.left = 90 + Object.keys(openApps).length * 25 + "px";
  win.style.top = 60 + Object.keys(openApps).length * 25 + "px";

  win.innerHTML =
    '<div class="titlebar">' +
    '<span class="title-text">' + info.title + "</span>" +
    '<div class="win-btn min">_</div>' +
    '<div class="win-btn close">X</div>' +
    "</div>" +
    '<div class="window-body">' + info.body + "</div>";

  document.getElementById("desktop").appendChild(win);

  var chip = document.createElement("div");
  chip.className = "task-chip";
  chip.textContent = info.title;
  chip.addEventListener("click", function () {
    win.classList.toggle("hidden");
  });
  document.getElementById("taskbar-apps").appendChild(chip);

  openApps[app] = { window: win, chip: chip };

  win.querySelector(".win-btn.close").addEventListener("click", function () {
    win.remove();
    chip.remove();
    delete openApps[app];
  });

  win.querySelector(".win-btn.min").addEventListener("click", function () {
    win.classList.add("hidden");
  });

  makeWindowDraggable(win);

  if (app === "terminal") {
    setupTerminal(win.querySelector(".window-body"));
  }
}

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
    win.style.left = startLeft + (e.clientX - startX) + "px";
    win.style.top = startTop + (e.clientY - startY) + "px";
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
}

function setupTerminal(body) {
  var output = body.querySelector("#terminal-output");
  var row = document.createElement("div");
  row.className = "terminal-input-row";
  row.innerHTML =
    '<span class="prompt">guest$</span>' +
    '<input class="terminal-input" autocomplete="off">';
  output.appendChild(row);
  var input = row.querySelector("input");

  function printLine(text) {
    var line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    output.insertBefore(line, row);
    output.scrollTop = output.scrollHeight;
  }

  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var text = input.value.trim();
    printLine("guest$ " + text);
    input.value = "";

    if (text === "help") {
      printLine("commands: help, about, date");
    } else if (text === "about") {
      printLine("MlinuxOS - work in progress");
    } else if (text === "date") {
      printLine(new Date().toString());
    } else if (text !== "") {
      printLine(text + ": command not found");
    }
  });

  output.addEventListener("mousedown", function () {
    setTimeout(function () {
      input.focus();
    }, 0);
  });
}