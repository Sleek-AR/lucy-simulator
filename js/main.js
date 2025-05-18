// main.js – Einstiegspunkt für Initialisierungen

import { setupVRControls } from './js/vr-controls.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialisiere VR-spezifische Controls
  setupVRControls();

  // Weitere Initialisierungen folgen hier
  console.log("Lucy Bewerbungssimulator geladen.");
});
