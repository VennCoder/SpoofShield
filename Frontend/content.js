let scannedEmails = {};
let scanInterval = null;

// Listen to session start/stop changes
chrome.storage.local.onChanged.addListener((changes) => {
  if ('isRunning' in changes) {
    const running = changes.isRunning.newValue;
    if (running) {
      console.log("[Content] Session started");
      scannedEmails = {};
      startAutoScan(true);  // Force first scan immediately
    } else {
      console.log("[Content] Session stopped — removing badges");
      removeAllBadges();
      scannedEmails = {};
    }
  }
});

// On load, check if scanning was already active
chrome.storage.local.get("isRunning", ({ isRunning }) => {
  if (isRunning) {
    scannedEmails = {};
    startAutoScan(true);
  }
});

function startAutoScan(immediate = false) {
  if (scanInterval) clearInterval(scanInterval);

  const scan = () => {
    chrome.storage.local.get("isRunning", ({ isRunning }) => {
      if (!isRunning) return;

      const subjEl = document.querySelector("h2[data-legacy-thread-id]");
      const content = document.querySelector(".ii.gt")?.innerText;
      const sender = document.querySelector(".gD")?.getAttribute("email");
      if (!subjEl || !content || !sender) return;

      const cleanSubj = getOriginalSubjectText(subjEl);
      const emailId = `${sender.toLowerCase()}|${cleanSubj.toLowerCase()}`;

      // ✅ Always scan first (even if in history)
      checkEmail(content, sender, subjEl, emailId, cleanSubj);

      // ✅ Then check if already in history and display badge if needed
      chrome.storage.local.get(["currentSession", "pastSessions", "isRunning"], (data) => {
        const all = [...(data.currentSession || []), ...(data.pastSessions || [])];
        const match = all.find(e =>
          e.subject.toLowerCase() === cleanSubj.toLowerCase() &&
          e.sender.toLowerCase() === sender.toLowerCase()
        );
        if (match && data.isRunning) {
          displayResultInline(subjEl, match.result);
        }
      });
    });
  };

  if (immediate) scan(); // Immediate scan once
  scanInterval = setInterval(scan, 4000); // Repeat every 4s
}

function removeAllBadges() {
  document.querySelectorAll(".spoof-result").forEach(el => el.remove());
  if (scanInterval) clearInterval(scanInterval);
}

function getOriginalSubjectText(el) {
  return [...el.childNodes]
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent.trim())
    .join(" ");
}

function checkEmail(content, sender, el, id, subj) {
  if (scannedEmails[id]) return;

  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_content: content })
  })
  .then(r => r.json())
  .then(data => {
    scannedEmails[id] = data.result;
    displayResultInline(el, data.result);
    storeScanHistory(id, subj, sender, data.result);
  })
  .catch(err => console.error("[Content] fetch error", err));
}

function displayResultInline(el, result) {
  removeExistingTag(el);
  const tag = document.createElement("span");
  tag.className = "spoof-result";
  tag.innerText = result === "spoofed" ? "Potential Spoof Email" : "Legit";
  tag.style.padding = "5px 10px";
  tag.style.marginLeft = "10px";
  tag.style.fontSize = "14px";
  tag.style.borderRadius = "5px";
  tag.style.fontWeight = "bold";
  tag.style.backgroundColor = result === "spoofed" ? "#f8d7da" : "#d4edda";
  el.appendChild(tag);
}

function removeExistingTag(el) {
  const existing = el.querySelector(".spoof-result");
  if (existing) existing.remove();
}

function storeScanHistory(id, subject, sender, result) {
  chrome.storage.local.get(["currentSession", "pastSessions"], data => {
    const clean = str => str.trim().toLowerCase();
    const current = data.currentSession || [];
    const past = data.pastSessions || [];

    const alreadyInCurrent = current.some(e =>
      clean(e.subject) === clean(subject) && clean(e.sender) === clean(sender)
    );
    if (alreadyInCurrent) return;

    const updatedPast = past.filter(e =>
      !(clean(e.subject) === clean(subject) && clean(e.sender) === clean(sender))
    );
    const updatedCurrent = current.concat({ id, subject, sender, result });

    chrome.storage.local.set({
      currentSession: updatedCurrent,
      pastSessions: updatedPast
    });
  });
}