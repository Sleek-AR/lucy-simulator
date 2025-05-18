import { initCallHandler } from './call-handler.js';

let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let micStream;

let log, blinker, lucy, recordButton, thinkingText, listeningText, roleSelect;

export function initLucyLogic() {
  // DOM-Elemente selektieren
  log = document.getElementById("log");
  blinker = document.getElementById("blinker");
  lucy = document.getElementById("lucy");
  recordButton = document.getElementById("recordButton");
  thinkingText = document.getElementById("thinkingText");
  listeningText = document.getElementById("listeningText");
  roleSelect = document.getElementById("roleSelect");

  // Maus & Trigger-Events
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

  // Init Anruf-Logik
  initCallHandler();

  // Globale Rollenauswahl
  window.setRole = setRole;
}

function setRole(role) {
  roleSelect.value = role;
  appendToLog(`🎭 Rolle geändert: ${role}`);
  const isPhoneMode = role === "telefon";
  lucy.setAttribute("visible", !isPhoneMode);
  lucy.setAttribute("scale", isPhoneMode ? "0 0 0" : "1.5 1.5 1.5");

  const callBtn = document.getElementById("simpleCallButton");
  if (callBtn) {
    callBtn.setAttribute("visible", isPhoneMode);
  }
}

function appendToLog(msg) {
  if (!log) return;
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
    appendToLog("⚠️ Konnte Antwort nicht abspielen.");
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
      appendToLog("🛑 Aufnahme gestoppt.");
      blinker.style.display = "none";
      listeningText.setAttribute("visible", false);
      if (micStream) micStream.getTracks().forEach((t) => t.stop());

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");

      appendToLog("⏳ Sende Audio an Server...");
      thinkingText.setAttribute("visible", true);

      try {
        const role = roleSelect.value || "recruiter";
        const res = await fetch(`/upload-audio?role=${role}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const reply = data.response || data.error || "Fehler bei Antwort";
        appendToLog("🤖 <b>Lucy:</b> " + reply);
        speak(reply);
      } catch (error) {
        console.error("Upload-Fehler:", error);
        appendToLog("❌ Fehler beim Senden oder Verarbeiten.");
        thinkingText.setAttribute("visible", false);
      }
    };

    mediaRecorder.start();
    blinker.style.display = "block";
    listeningText.setAttribute("visible", true);
    appendToLog("🎙️ Aufnahme läuft...");
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

// Für andere Module verfügbar machen
export { speak, startRecording, appendToLog };
