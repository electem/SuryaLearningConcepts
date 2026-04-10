import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Handle ES modules __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the audio directory exists
const audioDir = path.join(__dirname, "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

// Serve saved audio files
app.use("/audio", express.static(audioDir));

const ELEVEN_API = process.env.ELEVEN_API;
const VOICE_ID = process.env.VOICE_ID;

//POST /api/tts
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const outputPath = path.join(audioDir, `speech_${Date.now()}.mp3`);

    const response = await axios({
      method: "POST",
      url: `${ELEVEN_API}/${VOICE_ID}?output_format=mp3_44100_128`, 
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      data: {
        text,
        model_id: "eleven_multilingual_v2", 
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      responseType: "arraybuffer",
    });

    fs.writeFileSync(outputPath, response.data);
    console.log("Audio saved:", outputPath);

    const filename = path.basename(outputPath);
    res.json({
      message: "Audio generated successfully",
      audioUrl: `/audio/${filename}`,
    });
  } catch (error) {
    console.error(" ElevenLabs Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Failed to generate audio",
    });
  }
});

//  Simple test page
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif;">
        <h2>Text to Speech</h2>
        <form id="ttsForm">
          <textarea id="text" rows="4" cols="50">Hello, this is a test message</textarea><br/>
          <button type="submit">Generate</button>
        </form>
        <audio id="audioPlayer" controls style="margin-top: 1em; display: none;"></audio>
        <script>
          const form = document.getElementById('ttsForm');
          const audio = document.getElementById('audioPlayer');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = document.getElementById('text').value;
            const res = await fetch('/api/tts', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.audioUrl) {
              audio.src = data.audioUrl;
              audio.style.display = 'block';
              audio.play();
            }
          });
        </script>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at: http://localhost:${PORT}`)
);
