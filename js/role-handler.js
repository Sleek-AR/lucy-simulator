import { appendToLog } from './lucy-logic.js';

/**
 * Initialisiert die Rollenauswahl und globale Steuerung
 */
export function initRoleHandler() {
  // Definiere setRole global, damit es im VR-Menü funktioniert
  window.setRole = (role) => {
    const lucy = document.getElementById("lucy");
    const callBtn = document.getElementById("simpleCallButton");
    const roleSelect = document.getElementById("roleSelect");

    if (!lucy || !callBtn || !roleSelect) {
      console.warn("⚠️ setRole: Elemente fehlen.");
      return;
    }

    appendToLog(`🎭 Rolle geändert: ${role}`);

    const isPhoneMode = role === "telefon";

    lucy.setAttribute("visible", !isPhoneMode);
    lucy.setAttribute("scale", isPhoneMode ? "0 0 0" : "1.5 1.5 1.5");
    callBtn.setAttribute("visible", isPhoneMode);
    roleSelect.value = role;
  };

  // Auswahlmenü (Dropdown oben links)
  const roleSelect = document.getElementById("roleSelect");
  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      window.setRole(e.target.value);
    });

    // Starte mit aktueller Auswahl
    window.setRole(roleSelect.value);
  }
}
