const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 📁 Upload-Zielordner (temporär)
const upload = multer({ dest: 'uploads/' });

// 🧠 OpenAI initialisieren
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🌐 Statische Dateien bereitstellen (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// 🏠 Startseite (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🎤 Route zum Audio-Upload
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const audioPath = req.file.path;

    // 🔊 Transkription mit Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
    });

    const userText = transcription.text;

    // 💬 ChatGPT-Antwort
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userText }],
    });

    // 🧹 Aufräumen
    fs.unlinkSync(audioPath);

    // ✅ Antwort zurück an Client
    res.json({ response: gptResponse.choices[0].message.content });
  } catch (error) {
    console.error('Fehler bei /upload-audio:', error.message);
    res.status(500).json({ error: 'Fehler beim Verarbeiten der Audiodatei.' });
  }
});

// 🚀 Server starten (lokal oder bei Render)
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
