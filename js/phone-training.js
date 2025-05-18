// js/phone-training.js
export function initPhoneTraining({ startRecording, speak, append }) {
  const lucy = document.getElementById("lucy");
  const callBtn = document.getElementById("simpleCallButton");
  const roleSelect = document.getElementById("roleSelect");

  // 📞 Klingelton
  async function playRingtone() {
    return new Promise((resolve) => {
      const audio = new Audio(
        "https://raw.githubusercontent.com/Sleek-AR/lucy-simulator/main/public/sounds/ringtone-126505.mp3"
      );
      audio
        .play()
        .then(() => append("🔔 Klingelton startet..."))
        .catch((err) => {
          console.warn("Autoplay blockiert:", err);
          append("⚠️ Klingelton konnte nicht abgespielt werden.");
          resolve();
        });
      setTimeout(() => {
        audio.pause();
        resolve();
      }, 6000);
    });
  }

  // 📶 Anruf starten
  async function startCall() {
    append("📞 Wähle: +43 660 3262626");
    try {
      await playRingtone();
      append("📶 Verbindung aufgebaut!");
      speak("Willkommen bei Bürobedarf Berger. Mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
      startRecording();
    } catch (error) {
      append("⚠️ Klingelton blockiert. Starte direkt mit Begrüßung.");
      speak("Willkommen bei Bürobedarf Berger. Mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
      startRecording();
    }
  }

  // ⬇️ Button reagiert
  callBtn.addEventListener("click", startCall);

  // 🧠 Wird von setRole() aufgerufen
  window.setPhoneRole = function () {
    append("🎭 Rolle geändert: telefon");

    if (lucy) {
      lucy.setAttribute("visible", false);
      lucy.setAttribute("scale", "0 0 0");
    }

    callBtn.setAttribute("visible", true);

    if (typeof window.togglePhoneUI === "function") {
      window.togglePhoneUI(true);
    }
  };

  // Nur sichtbar bei aktivem Telefonmodus beim Start
  if (roleSelect.value === "telefon") {
    window.setPhoneRole();
  }
}
