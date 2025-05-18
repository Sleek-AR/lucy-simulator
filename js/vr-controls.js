// js/vr-controls.js

// Aktiviert oder deaktiviert Tastatursteuerung je nach VR-Modus
export function setupVRControls() {
  window.addEventListener("DOMContentLoaded", () => {
    const scene = document.querySelector("a-scene");
    const camera = document.getElementById("camera");

    scene.addEventListener("enter-vr", () => {
      camera.setAttribute("wasd-controls-enabled", false);
    });

    scene.addEventListener("exit-vr", () => {
      camera.setAttribute("wasd-controls-enabled", true);
    });
  });
}
