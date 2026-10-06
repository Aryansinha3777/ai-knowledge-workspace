import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}

export async function generateEmbeddings(texts: string[], retries = 3): Promise<number[][]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: texts,
        config: {
          outputDimensionality: 768,
        },
      });

      const embeddings = response.embeddings?.map((e) => e.values);

      if (!embeddings || embeddings.length !== texts.length || embeddings.some((e) => !e)) {
        throw new Error(
          `Expected ${texts.length} embeddings, got ${embeddings?.length ?? 0}`
        );
      }

      return embeddings as number[][];
    } catch (error: any) {
      const message = error?.message || '';
      const isDailyLimit = message.includes('PerDay');
      const isRateLimit = message.includes('RESOURCE_EXHAUSTED') || error?.status === 429;

      if (isDailyLimit) {
        throw new Error(
          'Daily embedding quota reached for the free tier. This resets at midnight Pacific Time — please try again later.'
        );
      }

      if (isRateLimit && attempt < retries) {
        const waitTime = 31000;
        console.warn(`Embedding rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})`);
        await delay(waitTime);
        continue;
      }

      throw error;
    }
  }

  throw new Error('Failed to generate embeddings after retries');
}