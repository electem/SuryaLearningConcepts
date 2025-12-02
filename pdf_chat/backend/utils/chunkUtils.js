import { v4 as uuidv4 } from "uuid";

export function chunkText(text, { chunkSize = 800, chunkOverlap = 100 } = {}) {
  if (!text || !text.trim()) return [];

  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/);

  const chunks = [];
  let current = "";
  let index = 0;

  for (let sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      chunks.push({
        id: uuidv4(),
        text: current.trim(),
        meta: { chunkIndex: index++ }
      });
      current = sentence; // start new chunk
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim()) {
    chunks.push({
      id: uuidv4(),
      text: current.trim(),
      meta: { chunkIndex: index++ }
    });
  }

  return chunks;
}
