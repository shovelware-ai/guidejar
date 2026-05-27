// Guidejar Capture — recorder content script.
//
// Runs on every page (declared in the manifest and re-injected on START so it
// activates on already-open tabs). It only does anything while recording is
// active for this tab. On each click it reports the click position (as 0..1
// viewport-relative coordinates, matching the app's hotspot model) plus a
// human label; the background grabs the screenshot.

(() => {
  if (window.__guidejarRecorderLoaded) {
    // Already injected in this page: just re-sync state and stop.
    chrome.runtime.sendMessage({ type: "GET_STATE" }, (state) => {
      if (chrome.runtime.lastError) return;
      window.__guidejarSetRecording?.(!!state?.recording, state?.count ?? 0);
    });
    return;
  }
  window.__guidejarRecorderLoaded = true;

  const BADGE_ID = "guidejar-capture-badge";
  let recording = false;
  let count = 0;
  let badge = null;

  function labelFor(el) {
    if (!el) return "";
    const text =
      el.getAttribute?.("aria-label") ||
      el.innerText ||
      el.value ||
      el.getAttribute?.("placeholder") ||
      el.alt ||
      el.title ||
      el.tagName?.toLowerCase() ||
      "";
    return text.trim().replace(/\s+/g, " ").slice(0, 50);
  }

  function onPointerDown(e) {
    // Ignore clicks on our own UI.
    if (e.target?.closest?.(`#${BADGE_ID}`)) return;
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const label = labelFor(e.target);
    chrome.runtime.sendMessage({
      type: "CLICK",
      x,
      y,
      title: label ? `Click “${label}”` : "Click here",
    });
    flash(e.clientX, e.clientY);
  }

  function flash(px, py) {
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position: "fixed",
      left: `${px}px`,
      top: `${py}px`,
      width: "16px",
      height: "16px",
      margin: "-8px 0 0 -8px",
      borderRadius: "50%",
      background: "rgba(99,102,241,0.6)",
      border: "2px solid #fff",
      pointerEvents: "none",
      zIndex: 2147483647,
      transition: "transform .4s ease, opacity .4s ease",
    });
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = "scale(2.5)";
      dot.style.opacity = "0";
    });
    setTimeout(() => dot.remove(), 450);
  }

  function showBadge() {
    if (badge) return;
    badge = document.createElement("div");
    badge.id = BADGE_ID;
    Object.assign(badge.style, {
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 2147483647,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 12px",
      background: "#111827",
      color: "#fff",
      borderRadius: "9999px",
      font: "13px/1 system-ui, sans-serif",
      boxShadow: "0 6px 20px rgba(0,0,0,.3)",
    });
    badge.innerHTML = `
      <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;animation:gjpulse 1.2s infinite"></span>
      <span>Recording · <b id="gj-count">0</b> steps</span>
      <button id="gj-stop" style="cursor:pointer;border:0;border-radius:9999px;background:#fff;color:#111827;font:600 12px system-ui;padding:5px 10px">Stop</button>
      <style>@keyframes gjpulse{0%{opacity:1}50%{opacity:.3}100%{opacity:1}}</style>`;
    document.body.appendChild(badge);
    badge.querySelector("#gj-stop").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "STOP" });
    });
    updateCount(count);
  }

  function hideBadge() {
    badge?.remove();
    badge = null;
  }

  function updateCount(n) {
    count = n;
    const el = badge?.querySelector("#gj-count");
    if (el) el.textContent = String(n);
  }

  function setRecording(on, c = 0) {
    recording = on;
    count = c;
    if (on) {
      document.addEventListener("pointerdown", onPointerDown, true);
      showBadge();
      updateCount(c);
    } else {
      document.removeEventListener("pointerdown", onPointerDown, true);
      hideBadge();
    }
  }
  window.__guidejarSetRecording = setRecording;

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "REC_STATE") setRecording(!!msg.recording, 0);
    else if (msg?.type === "REC_COUNT") updateCount(msg.count);
  });

  // On (re)load — e.g. after navigating within the recorded tab — resume.
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (state) => {
    if (chrome.runtime.lastError) return;
    if (state?.recording) setRecording(true, state.count ?? 0);
  });
})();
