var z = 10;

function openWin(id) {
  var w = document.getElementById(id);
  w.style.display = "flex";
  z++; w.style.zIndex = z;
  addTaskBtn(id);
  focusWin(id);
  startMenu.style.display = "none";
  ctxMenu.style.display = "none";
}

function closeWin(id) {
  var w = document.getElementById(id);
  w.style.display = "none";
  w.classList.remove("max");
  var b = document.getElementById("t-" + id);
  if (b) b.remove();
}

function minWin(id) { document.getElementById(id).style.display = "none"; }
function maxWin(id) { document.getElementById(id).classList.toggle("max"); }

function focusWin(id) {
  document.querySelectorAll(".window").forEach(function(w) { w.classList.remove("active"); });
  document.querySelectorAll(".taskapp").forEach(function(b) { b.classList.remove("on"); });
  var w = document.getElementById(id);
  w.classList.add("active");
  z++; w.style.zIndex = z;
  var b = document.getElementById("t-" + id);
  if (b) b.classList.add("on");
}

function addTaskBtn(id) {
  if (document.getElementById("t-" + id)) return;
  var b = document.createElement("button");
  b.id = "t-" + id;
  b.className = "taskapp";
  b.textContent = document.getElementById(id).dataset.title;
  b.onclick = function() {
    var w = document.getElementById(id);
    if (w.style.display === "none") openWin(id);
    else if (w.classList.contains("active")) minWin(id);
    else focusWin(id);
  };
  taskApps.appendChild(b);
}

var resizeWin = null, rw, rh, rx, ry;

document.querySelectorAll(".window").forEach(function(w) {
  w.addEventListener("mousedown", function() { focusWin(w.id); });

  var grip = document.createElement("div");
  grip.className = "grip";
  w.appendChild(grip);
  grip.addEventListener("mousedown", function(e) {
    e.stopPropagation();
    resizeWin = w;
    rx = e.clientX; ry = e.clientY;
    rw = w.offsetWidth; rh = w.offsetHeight;
    focusWin(w.id);
  });
});

var dragWin = null, dragX, dragY;

document.querySelectorAll(".titlebar").forEach(function(bar) {
  bar.addEventListener("mousedown", function(e) {
    if (e.target.tagName === "BUTTON") return;
    var w = bar.parentElement;
    if (w.classList.contains("max")) return;
    dragWin = w;
    dragX = e.clientX; dragY = e.clientY;
  });
  bar.addEventListener("dblclick", function(e) {
    if (e.target.tagName !== "BUTTON") maxWin(bar.parentElement.id);
  });
});

document.addEventListener("mousemove", function(e) {
  if (dragWin) {
    dragWin.style.left = (dragWin.offsetLeft + e.clientX - dragX) + "px";
    dragWin.style.top = Math.max(0, dragWin.offsetTop + e.clientY - dragY) + "px";
    dragX = e.clientX; dragY = e.clientY;
  }
  if (resizeWin) {
    resizeWin.style.width = Math.max(220, rw + e.clientX - rx) + "px";
    resizeWin.style.height = Math.max(140, rh + e.clientY - ry) + "px";
  }
  if (rightDownX !== null) {
    var dx = e.clientX - rightDownX, dy = e.clientY - rightDownY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      rightDragging = true;
      selectBox.style.display = "block";
      selectBox.style.left = Math.min(e.clientX, rightDownX) + "px";
      selectBox.style.top = Math.min(e.clientY, rightDownY) + "px";
      selectBox.style.width = Math.abs(dx) + "px";
      selectBox.style.height = Math.abs(dy) + "px";
    }
  }
});

document.addEventListener("mouseup", function() {
  dragWin = null;
  resizeWin = null;
  finishRightDrag();
});

startButton.onclick = function() {
  startMenu.style.display = startMenu.style.display === "block" ? "none" : "block";
};
document.addEventListener("click", function(e) {
  if (e.target !== startButton && !startMenu.contains(e.target)) startMenu.style.display = "none";
});

function tick() { clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
tick();
setInterval(tick, 1000);

commandInput.addEventListener("keydown", function(e) {
  if (e.key !== "Enter") return;
  var cmd = commandInput.value.trim().toLowerCase();
  printLine("user@mlinux:~$ " + commandInput.value);
  if (cmd === "help") printLine("commands: help, about, clear");
  else if (cmd === "about") printLine("MlinuxOS - built for the WebOS mission.");
  else if (cmd === "clear") terminalBody.querySelectorAll("p").forEach(function(p) { p.remove(); });
  else if (cmd) printLine("command not found: " + cmd);
  commandInput.value = "";
  terminalBody.scrollTop = terminalBody.scrollHeight;
});
function printLine(text) {
  var p = document.createElement("p");
  p.textContent = text;
  terminalBody.insertBefore(p, document.querySelector(".terminalinput"));
}

document.querySelectorAll(".icon").forEach(function(icon) {
  icon.addEventListener("click", function(e) {
    e.stopPropagation();
    document.querySelectorAll(".icon").forEach(function(i) { i.classList.remove("selected"); });
    icon.classList.add("selected");
  });
});

var rightDownX = null, rightDownY = null, rightDragging = false;

desktop.addEventListener("mousedown", function(e) {
  if (e.button !== 2 || e.target.closest(".window")) return;
  document.querySelectorAll(".icon").forEach(function(i) { i.classList.remove("selected"); });
  rightDownX = e.clientX; rightDownY = e.clientY;
  rightDragging = false;
});

function finishRightDrag() {
  if (rightDownX === null) return;
  if (rightDragging) {
    var box = selectBox.getBoundingClientRect();
    document.querySelectorAll(".icon").forEach(function(icon) {
      var r = icon.getBoundingClientRect();
      var hit = r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top;
      icon.classList.toggle("selected", hit);
    });
  } else {
    ctxMenu.style.left = rightDownX + "px";
    ctxMenu.style.top = rightDownY + "px";
    ctxMenu.style.display = "block";
  }
  selectBox.style.display = "none";
  rightDownX = null;
}

desktop.addEventListener("contextmenu", function(e) { e.preventDefault(); });
document.addEventListener("click", function(e) {
  if (!ctxMenu.contains(e.target)) ctxMenu.style.display = "none";
});

function refreshDesktop() {
  ctxMenu.style.display = "none";
  desktop.style.opacity = "0.4";
  setTimeout(function() { desktop.style.opacity = "1"; }, 150);
}

var ACCENTS = { blue: "#3d78b8", green: "#3d8b5a", purple: "#6a4d9e", red: "#a13d3d" };

function applyAccent(name, save) {
  var c = ACCENTS[name] || ACCENTS.blue;
  document.querySelectorAll(".titlebar, .startbutton, .starttitle, .taskapp.on").forEach(function(el) { el.style.background = c; });
  document.querySelectorAll(".swatch").forEach(function(s) { s.classList.toggle("active", s.dataset.accent === name); });
  if (save) localStorage.setItem("mlinux_accent", name);
}
document.querySelectorAll(".swatch").forEach(function(s) {
  s.addEventListener("click", function() { applyAccent(s.dataset.accent, true); });
});
applyAccent(localStorage.getItem("mlinux_accent") || "blue", false);

var WCODES = { 0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast", 45: "foggy", 61: "rain", 63: "rain", 71: "snow", 80: "showers", 95: "storms" };

function loadWeather(lat, lon) {
  weatherBody.textContent = "loading...";
  fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var w = data.current_weather;
      var desc = WCODES[w.weathercode] || "changing";
      weatherBody.innerHTML = '<div class="weatherbig">' + Math.round(w.temperature) + '&deg;C</div>' + desc + ', wind ' + w.windspeed + ' km/h' +
        '<br><button onclick="getWeather()">Refresh</button>';
    })
    .catch(function() {
      weatherBody.innerHTML = "couldn't reach the weather.<br><button onclick=\"getWeather()\">Try again</button>";
    });
}

function getWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) { loadWeather(pos.coords.latitude, pos.coords.longitude); },
      function() { loadWeather(25.3573, 55.4033); } 
    );
  } else {
    loadWeather(25.3573, 55.4033);
  }
}
getWeather();