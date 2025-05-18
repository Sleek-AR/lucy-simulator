// js/phone-training.js
export function initPhoneTraining({ startRecording, speak, append }) {
  const lucy = document.getElementById("lucy");
  const callBtn = document.getElementById("simpleCallButton");
  const roleSelect = document.getElementById("roleSelect");

  async function playRingtone() {
    return new Promise((resolve) => {
      const audio = new Audio(
        "https://raw.githubusercontent.com/Sleek-AR/lucy-simulator/main/public/sounds/ringtone-126505.mp3"
      );

      audio.play()
        .then(() => append("🔔 Klingelton startet..."))
        .catch((err) => {
          console.warn("Autoplay blockiert:", err);
          append("⚠️ Klingelton konnte nicht abgespielt werden (Autoplay-Sperre).");
          resolve();
        });

      setTimeout(() => {
        audio.pause();
        resolve();
      }, 6000);
    });
  }

  async function startCall() {
    append("📞 Wähle: +43 660 3262626");

    try {
      await playRingtone();
      append("📶 Verbindung wird hergestellt...");

      setTimeout(() => {
        append("✅ Verbindung aufgebaut!");
        speak("Willkommen bei Möbel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
        startRecording();
      }, 10000);
    } catch (error) {
      console.warn("Klingelton konnte nicht abgespielt werden:", error);
      append("⚠️ Klingelton blockiert. Starte direkt mit Begrüßung.");
      speak("Willkommen bei Möbel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
      startRecording();
    }
  }

  // Klick auf Button startet Gespräch
  callBtn.addEventListener("click", startCall);

  // Funktion wird global verfügbar gemacht
  window.setPhoneRole = function () {
    append("🎭 Rolle geändert: telefon");
    callBtn.setAttribute("visible", true);
    lucy.setAttribute("visible", false);
    lucy.setAttribute("scale", "0 0 0");
  };

  // Direkt aktivieren, falls bei Start schon "telefon" gewählt ist
  if (roleSelect.value === "telefon") {
    window.setPhoneRole();
  }
}
