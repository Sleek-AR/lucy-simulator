import { initAudioHandler, playVoiceFromText } from './audio-handler.js';
import { initCallHandler } from './call-handler.js';
import { initRoleHandler } from './role-handler.js';
import {
  initUIHandler,
  logMessage,
  setBlinker,
  setThinking,
  setListening
} from './ui-handler.js';

let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let micStream;

/**
 * Initialisiert alle Lucy-Komponenten und Logik
 */
export function initLucyLogic() {
  initUIHandler();
  initAudioHandler();
  initCallHandler();
  initRoleHandler();

  // Event-Listener für Aufnahme via Maus & Controller
  const recordButton = document.getElementById("recordButton");
  recordButton.addEventListener("mousedown", startRecording);
  recordButton.addEventListener("mouseup", stopRecording);
  recordButton.addEventListener("mouseleave", stopRecording);
  recordButton.addEventListener("triggerdown", startRecording);
  recordButton.addEventListener("triggerup", stopRecording);

  // Tastatur: Leertaste starten/stoppen
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") startRecording();
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") stopRecording();
  });

  // VR-Modus: Lucy skalieren
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
 * Spielt Text über Lucy (TTS)
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
      logMessage("🛑 Aufnahme gestoppt.");
      setBlinker(false);
      setListening(false);

      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
      }

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");

      logMessage("⏳ Sende Audio an Server...");
      setThinking(true);

      try {
        const roleSelect = document.getElementById("roleSelect");
        const role = roleSelect?.value || "recruiter";

        const res = await fetch(`/upload-audio?role=${role}`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const reply = data.response || data.error || "Fehler bei Antwort";

        logMessage("🤖 <b>Lucy:</b> " + reply);
        speak(reply);
      } catch (error) {
        console.error("Upload-Fehler:", error);
        logMessage("❌ Fehler beim Senden oder Verarbeiten.");
        setThinking(false);
      }
    };

    mediaRecorder.start();
    setBlinker(true);
    setListening(true);
    logMessage("🎙️ Aufnahme läuft...");
  } catch (err) {
    isRecording = false;
    console.error("Mikrofon-Fehler:", err);
    logMessage("⚠️ Mikrofonzugriff nicht möglich.");
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
