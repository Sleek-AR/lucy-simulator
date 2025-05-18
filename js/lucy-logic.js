import { initAudioHandler, playVoiceFromText } from './audio-handler.js';
import { initCallHandler } from './call-handler.js';
import { initRoleHandler } from './role-handler.js';

let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let micStream;

let log, blinker, recordButton, thinkingText, listeningText;

/**
 * Initialisiert alle Lucy-bezogenen Funktionen
 */
export function initLucyLogic() {
  // DOM-Elemente referenzieren
  log = document.getElementById("log");
  blinker = document.getElementById("blinker");
  recordButton = document.getElementById("recordButton");
  thinkingText = document.getElementById("thinkingText");
  listeningText = document.getElementById("listeningText");

  // Modul-Initialisierungen
  initAudioHandler();
  initCallHandler();
  initRoleHandler();

  // Aufnahme: Maus / Trigger
  recordButton.addEventListener("mousedown", startRecording);
  recordButton.addEventListener("mouseup", stopRecording);
  recordButton.addEventListener("mouseleave", stopRecording);
  recordButton.addEventListener("triggerdown", startRecording);
  recordButton.addEventListener("triggerup", stopRecording);

  // Aufnahme: Tastatur (Leertaste)
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") startRecording();
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") stopRecording();
  });

  // VR: Lucy skalieren
  AFRAME.scenes[0].addEventListener("enter-vr", () => {
    const lucy = document.getElementById("lucy");
    lucy?.setAttribute("scale", "0.5 0.5 0.5");
  });
  AFRAME.scenes[0].addEventListener("exit-vr", () => {
    const lucy = document.getElementById("lucy");
    lucy?.setAttribute("scale", "1.5 1.5 1.5");
  });
}

/**
 * Zeigt eine Nachricht im Log an
 * @param {string} msg - Textnachricht
 */
export function appendToLog(msg) {
  if (!log) return;
  log.innerHTML += `<div>${msg}</div>`;
  log.scrollTop = log.scrollHeight;
}

/**
 * Spricht einen Text über den TTS-Handler
 * @param {string} text
 */
export function speak(text) {
  playVoiceFromText(text);
}

/**
 * Startet die Audioaufnahme
 */
export async function startRecording() {
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
        const roleSelect = document.getElementById("roleSelect");
        const role = roleSelect?.value || "recruiter";

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

/**
 * Beendet die Aufnahme, wenn aktiv
 */
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}
