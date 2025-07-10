let isScanning = false;

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "startScanning") {
    isScanning = true;
    chrome.storage.local.set({ isRunning: true, startTime: Date.now() });
  } else if (request.action === "stopScanning") {
    isScanning = false;
    chrome.storage.local.set({ isRunning: false });
  }
});
