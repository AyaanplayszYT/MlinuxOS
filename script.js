function updateClock() {
  var now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);

document.getElementById("start-btn").addEventListener("click", function () {
  console.log("start menu not made yet");
});