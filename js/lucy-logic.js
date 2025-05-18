// js/lucy-logic.js

export function initLucyLogic() {
  const log = document.getElementById("log");
  const blinker = document.getElementById("blinker");
  const lucy = document.getElementById("lucy");
  const recordButton = document.getElementById("recordButton");
  const thinkingText = document.getElementById("thinkingText");
  const listeningText = document.getElementById("listeningText");
  const roleSelect = document.getElementById("roleSelect");

  let mediaRecorder;
  let audioChunks = [];
  let micStream;
  let isRecording = false;

  function append(msg) {
    log.innerHTML += `<div>${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }

  async function playVoiceFromText(text) {
    try {
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
    } catch (error) {
      console.error("TTS-Fehler:", error);
      append("⚠️ Konnte Antwort nicht abspielen.");
      thinkingText.setAttribute("visible", false);
    }
  }

  function speak(text) {
    playVoiceFromText(text);
  }

  async function startRecording() {
    if (isRecording) return;
    isRecording = true;

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(micStream, { mimeType: "audio/webm" });
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        isRecording = false;
        append("🛑 Aufnahme gestoppt.");
        blinker.style.display = "none";
        listeningText.setAttribute("visible", false);
        if (micStream) micStream.getTracks().forEach((t) => t.stop());

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "speech.webm");

        append("⏳ Sende Audio an Server...");
        thinkingText.setAttribute("visible", true);

        try {
          const role = roleSelect.value || "recruiter";
          const res = await fetch(`/upload-audio?role=${role}`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const reply = data.response || data.error || "Fehler bei Antwort";
          append("🤖 <b>Lucy:</b> " + reply);
          speak(reply);
        } catch (error) {
          console.error("Upload-Fehler:", error);
          append("❌ Fehler beim Senden oder Verarbeiten.");
          thinkingText.setAttribute("visible", false);
        }
      };

      mediaRecorder.start();
      blinker.style.display = "block";
      listeningText.setAttribute("visible", true);
      append("🎙️ Aufnahme läuft...");
    } catch (err) {
      isRecording = false;
      console.error("Mikrofon-Fehler:", err);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  }

  // Maus & Trigger
  recordButton.addEventListener("mousedown", startRecording);
  recordButton.addEventListener("mouseup", stopRecording);
  recordButton.addEventListener("mouseleave", stopRecording);
  recordButton.addEventListener("triggerdown", startRecording);
  recordButton.addEventListener("triggerup", stopRecording);

  // Leertaste
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") startRecording();
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") stopRecording();
  });

  // VR Skalierung
  AFRAME.scenes[0].addEventListener("enter-vr", () => {
    lucy.setAttribute("scale", "0.5 0.5 0.5");
  });
  AFRAME.scenes[0].addEventListener("exit-vr", () => {
    lucy.setAttribute("scale", "1.5 1.5 1.5");
  });

  // 📞 Telefonlogik
  const callBtn = document.getElementById("simpleCallButton");
  callBtn.addEventListener("click", async () => {
    append("📞 Wähle: +43 660 3262626");
    try {
      const ringtone = new Audio("sounds/ringtone-126505.mp3");
      await ringtone.play().catch(err => {
        append("⚠️ Klingelton nicht möglich.");
        throw err;
      });
      append("🔔 Klingelton spielt...");
      setTimeout(() => {
        ringtone.pause();
        append("✅ Verbindung aufgebaut!");
        speak("Willkommen bei Bürofachhandel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
        startRecording();
      }, 10000);
    } catch (e) {
      append("⚠️ Direktstart ohne Klingelton.");
      speak("Willkommen bei Bürofachhandel Berger, mein Name ist Frau Berger. Wie kann ich Ihnen helfen?");
      startRecording();
    }
  });

  // Rolle festlegen
  window.setRole = function(role) {
    roleSelect.value = role;
    append(`🎭 Rolle geändert: ${role}`);
    const isPhoneMode = role === "telefon";
    lucy.setAttribute("visible", !isPhoneMode);
    lucy.setAttribute("scale", isPhoneMode ? "0 0 0" : "1.5 1.5 1.5");
    callBtn.setAttribute("visible", isPhoneMode);
  };
}
