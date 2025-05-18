// main.js – Einstiegspunkt für Initialisierungen

import { setupVRControls } from './js/vr-controls.js';
import { initLucyLogic } from './js/lucy-logic.js';

window.addEventListener('load', () => {
  // Initialisiere VR-spezifische Steuerung
  setupVRControls();

  // Warte auf vollständiges Laden der A-Frame Szene
  const scene = document.querySelector("a-scene");
  if (scene?.hasLoaded) {
    initLucyLogic();
  } else {
    scene?.addEventListener("loaded", () => {
      initLucyLogic();
    });
  }

  console.log("Lucy Bewerbungssimulator geladen.");
});
