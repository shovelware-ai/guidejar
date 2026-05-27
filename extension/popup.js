// Guidejar Capture — popup UI.

const statusEl = document.getElementById("status");
const toggleEl = document.getElementById("toggle");
const downloadEl = document.getElementById("download");
const appUrlEl = document.getElementById("appUrl");

let recording = false;

async function refresh() {
  const state = await chrome.runtime.sendMessage({ type: "GET_STATE" });
  const { appUrl } = await chrome.storage.local.get("appUrl");
  const { session } = await chrome.storage.local.get("session");
  appUrlEl.value = appUrl || "http://localhost:3000";

  recording = !!state?.recording;
  const count = state?.count ?? 0;

  if (recording) {
    statusEl.innerHTML = `<span class="rec">● Recording</span> — ${count} step${count === 1 ? "" : "s"} captured. Click around the page, then Stop.`;
    toggleEl.textContent = "Stop recording";
    toggleEl.className = "danger";
  } else {
    statusEl.textContent =
      "Press start, then click through the steps you want to capture on the current tab.";
    toggleEl.textContent = "Start recording";
    toggleEl.className = "primary";
  }
  // Offer a download if there's a finished session with steps.
  downloadEl.hidden = !(session && session.steps && session.steps.length > 0 && !recording);
}

toggleEl.addEventListener("click", async () => {
  if (recording) {
    await chrome.runtime.sendMessage({ type: "STOP" });
    window.close();
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.runtime.sendMessage({ type: "START", tabId: tab.id });
    window.close(); // recording continues; the on-page badge takes over
  }
});

downloadEl.addEventListener("click", async () => {
  const { session } = await chrome.storage.local.get("session");
  if (!session?.steps?.length) return;
  const payload = {
    title: `Recorded guide — ${new Date(session.startedAt).toLocaleString()}`,
    steps: session.steps,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guidejar-capture.json";
  a.click();
  URL.revokeObjectURL(url);
});

appUrlEl.addEventListener("change", () => {
  chrome.storage.local.set({ appUrl: appUrlEl.value.trim() });
});

refresh();
