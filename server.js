import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const client = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: process.env.ARK_BASE_URL,
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 1. 语音转文字
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;

    const transcript = await client.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "gpt-4o-mini-transcribe",
      response_format: "text",
    });

    fs.unlinkSync(audioPath);

    res.json({ text: transcript });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "语音转文字失败" });
  }
});

// 2. AI 英语陪练回复
app.post("/api/chat", async (req, res) => {
  try {
    const { text } = req.body;

    const completion = await client.chat.completions.create({
    model: process.env.ARK_MODEL,
    messages: [
        {
        role: "system",
        content: `
    你是一个耐心的英语口语陪练。
    用户可能说中文，也可能说英文。

    你的规则：
    1. 如果用户说中文，你用中文解释，并给一句自然英文表达。
    2. 如果用户说英文，你先自然回答，再指出一个小错误或一个更地道的表达。
    3. 回复要短，不要超过 120 字。
    4. 风格要像真人老师，温和、鼓励、实用。
        `,
        },
        {
        role: "user",
        content: text,
        },
    ],
    });

    res.json({
    reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 回复失败" });
  }
});

// 3. 文字转语音
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;

    const speech = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions: "用温柔、清晰、鼓励的英语老师语气朗读。",
      response_format: "mp3",
    });

    const buffer = Buffer.from(await speech.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "文字转语音失败" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});