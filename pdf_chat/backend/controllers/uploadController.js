import express from "express";
import multer from "multer";
import { extractTextFromPdf } from "../utils/pdfUtils.js";
import { chunkText } from "../utils/chunkUtils.js";
import { upsertVectors } from "../utils/vectorStore.js";
import { embedTexts } from "../utils/embedProvider.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // 1️⃣ Extract text
    const rawText = await extractTextFromPdf(req.file.path);
    if (!rawText) return res.status(400).json({ error: "PDF is empty" });

    // 2️⃣ Chunk text
    const chunks = chunkText(rawText, { chunkSize: 800, chunkOverlap: 100 });
    if (!chunks.length) return res.status(400).json({ error: "No chunks created" });

    // 3️⃣ Prepare text array for embeddings
    const texts = chunks.map((c) => c.text).filter(Boolean);
    if (!texts.length) return res.status(400).json({ error: "No valid text for embedding" });

    // 4️⃣ Generate embeddings
    const embeddings = await embedTexts(texts);

    // 5️⃣ Prepare vector docs
    const vectorDocs = chunks.map((c, i) => ({
      id: c.id,
      text: c.text,
      meta: c.meta, 
      vector: embeddings[i] || [], // fallback empty embedding
    }));

    // 6️⃣ Upsert vectors
    await upsertVectors(vectorDocs);

    res.json({ ok: true, chunksInserted: vectorDocs.length });
  } catch (err) {
    console.error("UploadController error:", err);
    res.status(500).json({ error: "Upload error", message: err.message });
  }
});

export default router;
