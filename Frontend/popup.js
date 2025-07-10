let isRunning = false, timerInterval = null;

const btn = document.getElementById("sessionBtn");
const timerDisplay = document.getElementById("timer");
const currentDiv = document.getElementById("currentSession"),
      pastDiv = document.getElementById("pastSessions");

btn.addEventListener("click", () => {
  if (!isRunning) {
    chrome.runtime.sendMessage({ action: "startScanning" });
    chrome.storage.local.set({ isRunning: true, startTime: Date.now() }, () => initUI(true));
  } else {
    chrome.runtime.sendMessage({ action: "stopScanning" });
    chrome.storage.local.get(["currentSession", "pastSessions"], data => {
      chrome.storage.local.set({
        isRunning: false,
        currentSession: [],
        pastSessions: [...(data.pastSessions||[]), ...(data.currentSession||[])]
      }, () => initUI(false));
    });
  }
});

function initUI(run) {
  isRunning = run;
  btn.textContent = run ? "Stop Session" : "Start Session";
  btn.style.backgroundColor = run ? "#ff4d4d" : "#4CAF50";
  if (run) startTimer(); else stopTimer();
  renderHistory();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    chrome.storage.local.get("startTime", data => {
      if (!data.startTime) return stopTimer();
      let diff = Math.floor((Date.now() - data.startTime)/1000),
          m = String(Math.floor(diff/60)).padStart(2,'0'),
          s = String(diff % 60).padStart(2,'0');
      timerDisplay.textContent = `Active Session Time : ${m}:${s} ⏱`;
    });
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerDisplay.textContent = "";
}

function renderHistory() {
  chrome.storage.local.get(["currentSession", "pastSessions"], data => {
    currentDiv.innerHTML = formatEntries(data.currentSession) || "<i>No activity.</i>";
    pastDiv.innerHTML = formatEntries(data.pastSessions) || "<i>No past sessions.</i>";
  });
}

function formatEntries(arr=[]) {
  return arr.map(e => {
    let s = truncate(e.subject, 30);
    let cls = e.result === "spoofed" ? "spoofed-tag" : "legit-tag";
    return `<div class="history-item" title="Subject: ${e.subject}\nSender: ${e.sender}\nResult: ${e.result.charAt(0).toUpperCase() + e.result.slice(1)}">
              <span>${s}</span><div class="${cls}">${e.result.toUpperCase()}</div>
            </div>`;
  }).join("");
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// Initialize popup
chrome.storage.local.get(["isRunning", "startTime"], data => {
  initUI(data.isRunning);
});
