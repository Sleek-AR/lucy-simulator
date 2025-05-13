// ✅ server.js (mit Whisper, GPT und OpenAI TTS)
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

app.use(express.json());
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `uploads/${uuidv4()}.mp3`;

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: 'whisper-1'
    });

    const userText = transcription.text;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Du bist Lucy, die Personalleiterin von Spar, und führst ein Bewerbungsgespräch für die Lehrstelle zur Bürokauffrau bzw. zum Bürokaufmann durch. ... [gekürzt für Klarheit, bitte vollständig einsetzen]`
        },
        {
          role: 'user',
          content: userText
        }
      ]
    });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ response: gptResponse.choices[0].message.content });
  } catch (error) {
    console.error('Fehler bei /upload-audio:', error);
    res.status(500).json({ error: error.message || 'Verarbeitungsfehler' });
  }
});

// 🔊 OpenAI TTS
app.post('/tts', async (req, res) => {
  const { text } = req.body;
  try {
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      response_format: "mp3"
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    ttsResponse.body.pipe(res);
  } catch (error) {
    console.error('Fehler bei /tts:', error);
    res.status(500).json({ error: 'TTS fehlgeschlagen' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`🎧 Server läuft auf http://localhost:${port}`);
});
