import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function callLLM(prompt) {
  try {
    const res = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.error("GROQ LLM error:", err);
    return "No answer";
  }
}
