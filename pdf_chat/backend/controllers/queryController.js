import express from "express";
import { embedTexts } from "../utils/embedProvider.js";
import { searchVectorStore } from "../utils/vectorStore.js";
import { callLLM } from "../utils/llmProvider.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    const qEmb = (await embedTexts([question]))[0];

    console.log("🔍 Question Embedding Length:", qEmb?.length);

    const topK = parseInt(process.env.TOP_K || "4");

    const results = await searchVectorStore(qEmb, topK);

    console.log("🔍 Retrieved Chunks:", results.length);
    console.log("🔍 Top Scores:", results.map(r => r.score));

    const context = results.map((r, i) => `Chunk ${i + 1}:\n${r.text}`).join("\n\n");

    console.log("🔍 Context Preview:", context.slice(0, 300));

    if (!context.trim()) {
      console.log("❌ EMPTY CONTEXT — RAG FAILING");
    }

    const prompt = `
You are an AI that answers using ONLY the context below.
If the answer is not in the context, reply: "I don't know".

Context:
${context}

Question: ${question}
`;

    const answer = await callLLM(prompt);

    res.json({ answer, retrieved: results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed", message: err.message });
  }
});

export default router;
