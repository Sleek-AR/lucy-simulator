// 📦 ffmpeg & Abhängigkeiten
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const express = require('express');
const { OpenAI } = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 📁 Upload-Ordner definieren
const upload = multer({ dest: 'uploads/' });

// 🧠 OpenAI initialisieren
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 📤 Sprachaufnahme hochladen + konvertieren
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `uploads/${uuidv4()}.mp3`;

  try {
    // 🎛 Konvertiere .webm zu .mp3
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    // 🔊 Transkription mit Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: 'whisper-1',
    });

    const userText = transcription.text;

    // 💬 GPT-Antwort erzeugen
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userText }],
    });

    // ✅ Aufräumen
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ response: gptResponse.choices[0].message.content });
  } catch (error) {
    console.error('Fehler bei /upload-audio:', error);
    res.status(500).json({ error: error.message || 'Verarbeitungsfehler' });
  }
});

// 🌐 Startseite anzeigen
app.use(express.static(path.join(__dirname, 'public')));

// 🚀 Starten
app.listen(port, () => {
  console.log(`🎧 Server läuft auf http://localhost:${port}`);
});
