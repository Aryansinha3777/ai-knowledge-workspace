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

export async function* streamAnswer(context: string, question: string) {
  const systemPrompt = `You are a helpful assistant that answers questions based ONLY on the provided context.

Rules:
- Only use information from the context below to answer.
- If the context does not contain enough information to answer the question, say so clearly instead of guessing or using outside knowledge.
- Be concise and direct.
- Do not mention "the context" explicitly in your answer — just answer naturally as if you know this information.

Context:
${context}`;

  const stream = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    temperature: 0.3,
    stream: true,
  });

  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content;
    if (token) {
      yield token;
    }
  }
}

export async function generateSummary(documentText: string): Promise<string> {
  const systemPrompt = `You are a helpful assistant that writes clear, concise summaries of documents.

Rules:
- Summarize the key points and main ideas of the document below.
- Keep the summary well-organized and easy to read (use short paragraphs or bullet points where helpful).
- Do not add information that isn't in the document.
- Keep it concise — aim for a few short paragraphs, not a page-by-page recap.

Document:
${documentText}`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Summarize this document.' }],
    temperature: 0.3,
  });

  const summary = response.choices?.[0]?.message?.content;

  if (!summary) {
    throw new Error('Failed to generate summary');
  }

  return summary;
}

export async function generateTitle(question: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content:
          'Generate a short, specific title (3-6 words) that captures the topic of the user\'s question below. The title should describe WHAT the question is about, not describe that it is a "conversation" or "new chat". Respond with ONLY the title text, no quotes, no punctuation at the end, no prefixes like "Title:".',
      },
      { role: 'user', content: question },
    ],
    temperature: 0.3,
    max_tokens: 50,
    reasoning_effort: 'low',
  } as any);

  const rawTitle = response.choices?.[0]?.message?.content;

  const title = rawTitle?.trim();

  if (!title || title.length === 0) {
    return 'New Conversation';
  }

  return title;
}

export async function rewriteQuery(
  conversationHistory: { role: string; content: string }[],
  question: string
): Promise<string> {
  if (conversationHistory.length === 0) {
    return question;
  }

  const historyText = conversationHistory
    .slice(-4)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `Given a conversation history and a follow-up question, rewrite the follow-up question into a standalone question that includes all necessary context, so it can be understood without the conversation history.

Rules:
- If the question is already standalone and doesn't depend on prior context, return it unchanged.
- Do not answer the question, only rewrite it.
- Respond with ONLY the rewritten question, no explanation, no quotes.

Conversation history:
${historyText}`,
      },
      { role: 'user', content: question },
    ],
    temperature: 0.1,
    max_tokens: 100,
    reasoning_effort: 'low',
  } as any);

  const rewritten = response.choices?.[0]?.message?.content?.trim();
  return rewritten && rewritten.length > 0 ? rewritten : question;
}


interface RerankCandidate {
  index: number;
  content: string;
}

export async function rerankChunks(
  question: string,
  candidates: RerankCandidate[],
  topN: number
): Promise<number[]> {
  const candidateText = candidates
    .map((c) => `[${c.index}] ${c.content.slice(0, 300)}`)
    .join('\n\n');

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are given a question and a list of numbered text passages. Select the ${topN} passages that are MOST relevant to answering the question, ranked from most to least relevant.

Respond with ONLY a comma-separated list of the passage numbers, e.g. "3,1,7,2,5". No explanation, no other text.`,
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nPassages:\n${candidateText}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 50,
    reasoning_effort: 'low',
  } as any);

  const raw = response.choices?.[0]?.message?.content?.trim() || '';
  const indices = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && candidates.some((c) => c.index === n));

  return indices.length > 0 ? indices.slice(0, topN) : candidates.slice(0, topN).map((c) => c.index);
}