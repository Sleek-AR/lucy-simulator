// audio-handler.js

import { appendToLog } from './lucy-logic.js';

let lucy = null;
let thinkingText = null;

/**
 * Initialisiert Audio-Komponenten: Lucy-Avatar & Denknachricht
 */
export function initAudioHandler() {
  lucy = document.getElementById("lucy");
  thinkingText = document.getElementById("thinkingText");

  if (!lucy || !thinkingText) {
    console.warn("❗ Lucy oder thinkingText konnte nicht gefunden werden.");
  }
}

/**
 * Spielt Sprache über den Server (TTS) ab und steuert Lucy
 * @param {string} text - Der zu sprechende Text
 */
export async function playVoiceFromText(text) {
  try {
    const response = await fetch("/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("TTS-Serverfehler");

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    lucy?.emit("speak");
    thinkingText?.setAttribute("visible", false);

    audio.play();
    audio.onended = () => {
      lucy?.emit("stopspeak");
    };
  } catch (error) {
    console.error("TTS-Fehler:", error);
    appendToLog("⚠️ Konnte Antwort nicht abspielen.");
    thinkingText?.setAttribute("visible", false);
  }
}
