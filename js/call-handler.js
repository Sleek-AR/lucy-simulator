// call-handler.js

import { speak, startRecording, appendToLog } from './lucy-logic.js';

export function initCallHandler() {
  const callBtn = document.getElementById("simpleCallButton");

  if (!callBtn) {
    console.warn("📞 Call-Button nicht gefunden.");
    return;
  }

  callBtn.addEventListener("click", async () => {
    appendToLog("📞 Wähle: +43 660 3262626");

    try {
      await playRingtone();
      appendToLog("📶 Verbindung wird hergestellt...");

      setTimeout(() => {
        appendToLog("✅ Verbindung aufgebaut!");
        speak(
          "Willkommen bei Bürofachhandel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?"
        );
        startRecording();
      }, 10000);
    } catch (error) {
      console.warn("Klingelton konnte nicht abgespielt werden:", error);
      appendToLog("⚠️ Klingelton blockiert. Starte direkt mit Begrüßung.");
      speak(
        "Willkommen bei Bürofachhandel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?"
      );
      startRecording();
    }
  });
}

function playRingtone() {
  return new Promise((resolve) => {
    const audio = new Audio("sounds/ringtone-126505.mp3");

    audio
      .play()
      .then(() => {
        appendToLog("🔔 Klingelton startet...");
      })
      .catch((err) => {
        console.warn("Autoplay blockiert:", err);
        appendToLog(
          "⚠️ Klingelton konnte nicht abgespielt werden (Autoplay-Sperre)."
        );
        resolve();
      });

    setTimeout(() => {
      audio.pause();
      resolve();
    }, 6000);
  });
}
