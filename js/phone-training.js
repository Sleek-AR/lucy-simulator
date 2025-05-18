// js/phone-training.js
export function initPhoneTraining() {
  const log = document.getElementById("log");
  const lucy = document.getElementById("lucy");
  const thinkingText = document.getElementById("thinkingText");
  const listeningText = document.getElementById("listeningText");
  const blinker = document.getElementById("blinker");
  const roleSelect = document.getElementById("roleSelect");
  const callBtn = document.getElementById("simpleCallButton");

  function append(msg) {
    log.innerHTML += `<div>${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }

  async function playVoiceFromText(text) {
    const response = await fetch("/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    lucy.emit("speak");
    thinkingText.setAttribute("visible", false);
    audio.play();
    audio.onended = () => lucy.emit("stopspeak");
  }

  async function playRingtone() {
    return new Promise((resolve) => {
      const audio = new Audio(
        "https://raw.githubusercontent.com/Sleek-AR/lucy-simulator/main/public/sounds/ringtone-126505.mp3"
      );

      audio.play().then(() => {
        append("🔔 Klingelton startet...");
      }).catch((err) => {
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

  async function startCall(startRecording) {
    append("📞 Wähle: +43 660 3262626");
    try {
      await playRingtone();
      append("📶 Verbindung wird hergestellt...");

      setTimeout(() => {
        append("✅ Verbindung aufgebaut!");
        playVoiceFromText("Willkommen bei Möbel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
        startRecording();
      }, 10000);
    } catch (err) {
      append("⚠️ Klingelton blockiert. Starte direkt mit Begrüßung.");
      playVoiceFromText("Willkommen bei Möbel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
      startRecording();
    }
  }

  // Call-Button-Event
  callBtn.addEventListener("click", () => startCall(window.startRecording));

  // Exponiert Funktion, damit sie in index.html genutzt werden kann
  window.setPhoneRole = function () {
    append("🎭 Rolle geändert: telefon");

    callBtn.setAttribute("visible", true);
    lucy.setAttribute("visible", false);
    lucy.setAttribute("scale", "0 0 0");
  };

  // Optional: bei Rollenauswahl direkt aktivieren
  if (roleSelect.value === "telefon") {
    window.setPhoneRole();
  }
}
