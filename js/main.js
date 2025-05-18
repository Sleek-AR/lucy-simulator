// main.js – Einstiegspunkt für Initialisierungen

import { setupVRControls } from './js/vr-controls.js';
import { initLucyLogic } from './js/lucy-logic.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialisiere VR-spezifische Controls
  setupVRControls();

  // Initialisiere Lucy-Logik (Audio, UI, Rollenwahl etc.)
  initLucyLogic();

  console.log("Lucy Bewerbungssimulator geladen.");
});
