// Guidejar Capture — background service worker (MV3).
//
// Owns the recording state machine. State lives in chrome.storage.local so it
// survives the service worker being suspended between events.
//
//   session       { recording, tabId, windowId, steps[], startedAt }
//   pendingImport { title, steps[] }   <- handed to the app via bridge.js
//   appUrl        string               <- where to open /import on stop

const DEFAULT_APP_URL = "http://localhost:3000";

async function getSession() {
  const { session } = await chrome.storage.local.get("session");
  return session ?? { recording: false, tabId: null, windowId: null, steps: [] };
}

async function setSession(session) {
  await chrome.storage.local.set({ session });
}

async function getAppUrl() {
  const { appUrl } = await chrome.storage.local.get("appUrl");
  return (appUrl || DEFAULT_APP_URL).replace(/\/+$/, "");
}

async function startRecording(tabId) {
  const tab = await chrome.tabs.get(tabId);
  await setSession({
    recording: true,
    tabId,
    windowId: tab.windowId,
    steps: [],
    startedAt: Date.now(),
  });
  // The recorder is also declared in the manifest, but inject explicitly so it
  // activates on tabs that were already open before recording started.
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["recorder.js"] });
  } catch {
    /* e.g. chrome:// pages can't be scripted; ignore. */
  }
  chrome.tabs.sendMessage(tabId, { type: "REC_STATE", recording: true }).catch(() => {});
}

async function stopRecording() {
  const session = await getSession();
  if (session.tabId != null) {
    chrome.tabs.sendMessage(session.tabId, { type: "REC_STATE", recording: false }).catch(() => {});
  }
  await setSession({ ...session, recording: false });

  if (session.steps.length > 0) {
    const pendingImport = {
      title: `Recorded guide — ${new Date(session.startedAt).toLocaleString()}`,
      steps: session.steps,
    };
    await chrome.storage.local.set({ pendingImport });
    const appUrl = await getAppUrl();
    await chrome.tabs.create({ url: `${appUrl}/import` });
  }
}

async function recordClick(tab, click) {
  const session = await getSession();
  if (!session.recording || tab?.id !== session.tabId) return;
  let imageDataUrl;
  try {
    imageDataUrl = await chrome.tabs.captureVisibleTab(session.windowId, {
      format: "png",
    });
  } catch {
    return; // capture can fail (e.g. throttled or protected page); skip step
  }
  session.steps.push({
    imageDataUrl,
    hotspot: { x: click.x, y: click.y },
    title: click.title || `Step ${session.steps.length + 1}`,
  });
  await setSession(session);
  // Let the recorder badge reflect the new count.
  chrome.tabs
    .sendMessage(session.tabId, { type: "REC_COUNT", count: session.steps.length })
    .catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg?.type) {
      case "START":
        await startRecording(msg.tabId);
        sendResponse({ ok: true });
        break;
      case "STOP":
        await stopRecording();
        sendResponse({ ok: true });
        break;
      case "CLICK":
        await recordClick(sender.tab, msg);
        sendResponse({ ok: true });
        break;
      case "GET_STATE": {
        const session = await getSession();
        // For the recorder, "recording" is true only on the recorded tab.
        const forThisTab =
          sender.tab != null ? sender.tab.id === session.tabId : true;
        sendResponse({
          recording: session.recording && forThisTab,
          count: session.steps.length,
          tabId: session.tabId,
        });
        break;
      }
      case "BRIDGE_PULL": {
        const { pendingImport } = await chrome.storage.local.get("pendingImport");
        sendResponse({ pendingImport: pendingImport ?? null });
        break;
      }
      case "BRIDGE_CLEAR":
        await chrome.storage.local.remove("pendingImport");
        sendResponse({ ok: true });
        break;
      default:
        sendResponse({ ok: false });
    }
  })();
  return true; // keep the message channel open for the async response
});
