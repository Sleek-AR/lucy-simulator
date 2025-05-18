// ui-handler.js

let logEl = null;
let blinkerEl = null;
let thinkingTextEl = null;
let listeningTextEl = null;

/**
 * Initialisiert die UI-Elemente: Log, Blinker, Statusanzeigen
 */
export function initUIHandler() {
  logEl = document.getElementById("log");
  blinkerEl = document.getElementById("blinker");
  thinkingTextEl = document.getElementById("thinkingText");
  listeningTextEl = document.getElementById("listeningText");

  if (!logEl || !blinkerEl || !thinkingTextEl || !listeningTextEl) {
    console.warn("⚠️ Einige UI-Elemente konnten nicht geladen werden.");
  }
}

/**
 * Fügt eine Zeile im Logfenster hinzu
 * @param {string} message
 */
export function logMessage(message) {
  if (!logEl) return;
  logEl.innerHTML += `<div>${message}</div>`;
  logEl.scrollTop = logEl.scrollHeight;
}

/**
 * Aktiviert oder deaktiviert den roten Aufnahmeblinker
 * @param {boolean} isVisible
 */
export function setBlinker(isVisible) {
  if (!blinkerEl) return;
  blinkerEl.style.display = isVisible ? "block" : "none";
}

/**
 * Zeigt "Lucy denkt nach..."
 * @param {boolean} isVisible
 */
export function setThinking(isVisible) {
  if (!thinkingTextEl) return;
  thinkingTextEl.setAttribute("visible", isVisible);
}

/**
 * Zeigt "Lucy hört gerade zu..."
 * @param {boolean} isVisible
 */
export function setListening(isVisible) {
  if (!listeningTextEl) return;
  listeningTextEl.setAttribute("visible", isVisible);
}
