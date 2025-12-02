import fs from "fs/promises";

const FILE = process.env.VECTOR_FILE || "./data/vectors.json";

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeStore(data) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

export async function upsertVectors(items) {
  const store = await readStore();
  const map = new Map(store.map((i) => [i.id, i]));

  items.forEach((i) => map.set(i.id, i));

  const updated = [...map.values()];
  await writeStore(updated);
  return updated.length;
}

function cosine(a, b) {
  let dot = 0,
    ma = 0,
    mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

export async function searchVectorStore(queryVec, topK) {
  const store = await readStore();
  return store
    .map((v) => ({ ...v, score: cosine(queryVec, v.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
