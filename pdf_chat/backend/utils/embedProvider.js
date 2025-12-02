import { pipeline } from "@xenova/transformers";

let extractor = null;

export async function embedTexts(inputs) {
  if (!inputs || inputs.length === 0) return [];

  // Load the model only once
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  const output = [];
  for (const text of inputs) {
    const emb = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    output.push(Array.from(emb.data));
  }

  return output;
}
