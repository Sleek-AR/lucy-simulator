rrequire("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static("public"));

// 🔁 Prompt-Ladefunktion
function loadPrompt(role = "lucy") {
  try {
    const filePath = path.join(__dirname, "prompts", `${role}.txt`);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    console.warn(`⚠️ Prompt "${role}" nicht gefunden. Fallback auf "lucy.txt"`);
    return fs.readFileSync(path.join(__dirname, "prompts", "lucy.txt"), "utf-8");
  }
}

// 📁 Gesprächsverläufe-Ordner
const conversationDir = path.join(__dirname, "conversations");
if (!fs.existsSync(conversationDir)) fs.mkdirSync(conversationDir);

// 🔁 Spracheingabe-Upload + GPT-Antwort mit Verlauf
app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const role = req.query.role || "lucy";
    const inputPath = req.file.path;
    const outputPath = `${inputPath}.mp3`;

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${inputPath} -ar 44100 -ac 1 -b:a 128k ${outputPath}`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
      response_format: "json",
    });

    const userInput = transcription.text;
    const systemPrompt = loadPrompt(role);
    const conversationPath = path.join(conversationDir, `${role}.json`);

    let history = [];
    if (fs.existsSync(conversationPath)) {
      const data = fs.readFileSync(conversationPath, "utf-8");
      history = JSON.parse(data);
    }

    history.push({ role: "user", content: userInput });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
    });

    const assistantReply = completion.choices[0].message.content;
    history.push({ role: "assistant", content: assistantReply });

    fs.writeFileSync(conversationPath, JSON.stringify(history, null, 2), "utf-8");

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ response: assistantReply });
  } catch (error) {
    console.error("❌ Fehler bei Upload:", error);
    res.status(500).json({ error: "Serverfehler", details: error.message });
  }
});

// 🔊 TTS-Ausgabe mit Stimmwahl je Rolle
app.post("/tts", async (req, res) => {
  const { text, role = "lucy" } = req.body;

  // 📢 Stimme wählen
  let voice = "nova";
  if (role === "paul") voice = "onyx";

  try {
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
    });

    res.setHeader("Content-Type", "audio/mpeg");
    ttsResponse.body.pipe(res);
  } catch (error) {
    console.error("❌ Fehler bei TTS:", error);
    res.status(500).json({ error: "TTS fehlgeschlagen", details: error.message });
  }
});

// 🚀 Start
app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
});
