// role-handler.js

import { appendToLog } from './lucy-logic.js';

/**
 * Initialisiert die Rollenauswahl und das Verhalten bei Rollenumschaltung
 */
export function initRoleHandler() {
  const roleSelect = document.getElementById("roleSelect");
  const lucy = document.getElementById("lucy");
  const callBtn = document.getElementById("simpleCallButton");

  if (!roleSelect || !lucy || !callBtn) {
    console.warn("❗ Rollenelemente nicht vollständig gefunden.");
    return;
  }

  // Auswahlmenü (Dropdown oben links)
  roleSelect.addEventListener("change", (e) => {
    setRole(e.target.value, { lucy, callBtn });
  });

  // Rolle initial setzen (falls gewünscht)
  setRole(roleSelect.value, { lucy, callBtn });

  // Ermögliche externe Steuerung durch z. B. VR-Buttons
  window.setRole = (role) => setRole(role, { lucy, callBtn });
}

/**
 * Setzt die aktuelle Rolle (z. B. "recruiter", "telefon", etc.)
 * und steuert die UI entsprechend
 * @param {string} role - Rollenname
 * @param {Object} elements - DOM-Elemente: lucy & callBtn
 */
function setRole(role, { lucy, callBtn }) {
  appendToLog(`🎭 Rolle geändert: ${role}`);

  const isPhoneMode = role === "telefon";

  lucy.setAttribute("visible", !isPhoneMode);
  lucy.setAttribute("scale", isPhoneMode ? "0 0 0" : "1.5 1.5 1.5");
  callBtn.setAttribute("visible", isPhoneMode);

  const roleSelect = document.getElementById("roleSelect");
  if (roleSelect) roleSelect.value = role;
}
