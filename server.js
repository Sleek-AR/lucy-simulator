require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { OpenAI } = require("openai");

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static("public"));

// 🔁 Prompt-Ladefunktion
function loadPrompt(role = "lucy") {
  try {
    const filePath = path.join(__dirname, "prompts", `${role}.txt`);
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.warn(`⚠️ Prompt "${role}" nicht gefunden. Fallback auf "lucy.txt"`);
    return fs.readFileSync(
      path.join(__dirname, "prompts", "lucy.txt"),
      "utf-8"
    );
  }
}

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const role = req.query.role || "lucy"; // 👈 aktiver Sprecher (Lucy oder Paul)
    const inputPath = req.file.path;
    const outputPath = `${inputPath}.mp3`;

    // 🔁 Audio nach MP3 konvertieren (Whisper-kompatibel)
    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i ${inputPath} -ar 44100 -ac 1 -b:a 128k ${outputPath}`,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // 🎙️ Audio an Whisper senden
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
      response_format: "json",
    });

    const userInput = transcription.text;

    // 🧠 Prompt laden (z. B. prompts/paul.txt)
    const systemPrompt = loadPrompt(role);

    // 💬 GPT antwortet
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    const assistantReply = completion.choices[0].message.content;
    res.json({ text: assistantReply });

    // 🧹 Aufräumen
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error("❌ Fehler bei Upload:", error);
    res.status(500).json({ error: "Serverfehler", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
});
