import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

export async function embedText(input: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input
  });

  const [embedding] = res.data;
  return embedding.embedding as unknown as number[];
}

export async function embedQuery(query: string): Promise<number[]> {
  return embedText(query);
}

