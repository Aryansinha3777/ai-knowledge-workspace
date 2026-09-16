import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY as string });

export async function generateAnswer(context: string, question: string): Promise<string> {
  const systemPrompt = `You are a helpful assistant that answers questions based ONLY on the provided context.

Rules:
- Only use information from the context below to answer.
- If the context does not contain enough information to answer the question, say so clearly instead of guessing or using outside knowledge.
- Be concise and direct.
- Do not mention "the context" explicitly in your answer — just answer naturally as if you know this information.

Context:
${context}`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    temperature: 0.3,
  });

  const answer = response.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error('Failed to generate answer');
  }

  return answer;
}