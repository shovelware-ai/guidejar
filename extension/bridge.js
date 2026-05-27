// Guidejar Capture — page bridge.
//
// Runs only on the app's origin (localhost). The extension can't write to the
// app's IndexedDB directly, so this content script relays a pending capture to
// the page via window.postMessage; the app's /import page does the actual
// import. Content scripts share the page's `window`, so postMessage works, but
// they can't read page IndexedDB — keeping the app in charge of its own data.

(() => {
  let delivered = false;

  function sendPayload() {
    if (delivered) return;
    chrome.runtime.sendMessage({ type: "BRIDGE_PULL" }, (resp) => {
      if (chrome.runtime.lastError) return;
      const payload = resp?.pendingImport;
      if (!payload) return;
      delivered = true;
      window.postMessage({ type: "GUIDEJAR_IMPORT", payload }, window.origin);
    });
  }

  window.addEventListener("message", (e) => {
    if (e.source !== window || !e.data) return;
    const type = e.data.type;
    if (type === "GUIDEJAR_IMPORT_READY") {
      sendPayload();
    } else if (type === "GUIDEJAR_IMPORT_DONE") {
      chrome.runtime.sendMessage({ type: "BRIDGE_CLEAR" });
    }
  });

  // Announce ourselves in case the page's listener mounted before us.
  window.postMessage({ type: "GUIDEJAR_BRIDGE_READY" }, window.origin);
})();
