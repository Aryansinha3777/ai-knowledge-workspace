import { prisma } from '../config/prisma';
import { semanticSearch } from './search.service';
import { generateAnswer, streamAnswer, generateTitle, rewriteQuery, rerankChunks } from './llm.service';

interface Source {
  documentId: string;
  filename: string;
  chunkIndex: number;
  similarity: number;
}

export async function askQuestion(
  userId: string,
  conversationId: string,
  question: string,
  scope: { workspaceId?: string; documentId?: string }
) {
  const chunks = await semanticSearch(userId, question, {
    workspaceId: scope.workspaceId,
    documentId: scope.documentId,
    topK: 5,
  });

  await prisma.message.create({
    data: {
      conversationId,
      role: 'USER',
      content: question,
    },
  });

  if (chunks.length === 0) {
    const noContextAnswer =
      "I couldn't find any relevant information in your documents to answer this question.";

    await prisma.message.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: noContextAnswer,
        sources: [],
      },
    });

    return { answer: noContextAnswer, sources: [] };
  }

  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`)
    .join('\n\n');

  const answer = await generateAnswer(context, question);

  const sources: Source[] = chunks.map((c) => ({
    documentId: c.documentId,
    filename: c.filename,
    chunkIndex: c.chunkIndex,
    similarity: c.similarity,
  }));

  await prisma.message.create({
    data: {
      conversationId,
      role: 'ASSISTANT',
      content: answer,
      sources: sources as any,
    },
  });

  return { answer, sources };
}

export async function* askQuestionStream(
  userId: string,
  conversationId: string,
  question: string,
  scope: { workspaceId?: string; documentId?: string }
) {
  const previousMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: { role: true, content: true },
  });

  const searchQuery = await rewriteQuery(previousMessages, question);

  yield { type: 'status' as const, stage: 'searching' };

  const candidates = await semanticSearch(userId, searchQuery, {
    workspaceId: scope.workspaceId,
    documentId: scope.documentId,
    topK: 15,
  });

  let chunks = candidates;

  if (candidates.length > 5) {
    yield { type: 'status' as const, stage: 'reranking' };

    const rerankInput = candidates.map((c, i) => ({ index: i, content: c.content }));
    const selectedIndices = await rerankChunks(searchQuery, rerankInput, 5);
    chunks = selectedIndices.map((i) => candidates[i]).filter(Boolean);
  }

  await prisma.message.create({
    data: { conversationId, role: 'USER', content: question },
  });

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  const needsTitle = conversation && (!conversation.title || conversation.title === 'New Conversation');

  const titlePromise = needsTitle
    ? generateTitle(question).catch(() => 'New Conversation')
    : null;

  if (chunks.length === 0) {
    const noContextAnswer =
      "I couldn't find any relevant information in your documents to answer this question.";

    await prisma.message.create({
      data: { conversationId, role: 'ASSISTANT', content: noContextAnswer, sources: [] },
    });

    yield { type: 'sources' as const, sources: [] };
    yield { type: 'token' as const, token: noContextAnswer };
    yield { type: 'done' as const };
    return;
  }

  const sources = chunks.map((c) => ({
    documentId: c.documentId,
    filename: c.filename,
    chunkIndex: c.chunkIndex,
    similarity: c.similarity,
  }));

  yield { type: 'status' as const, stage: 'found', count: sources.length };
  yield { type: 'sources' as const, sources };
  yield { type: 'status' as const, stage: 'generating' };

  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`)
    .join('\n\n');

  let fullAnswer = '';

  for await (const token of streamAnswer(context, question)) {
    fullAnswer += token;
    yield { type: 'token' as const, token };
  }

    await prisma.message.create({
    data: { conversationId, role: 'ASSISTANT', content: fullAnswer, sources: sources as any },
  });

  if (titlePromise) {
    const title = await titlePromise;
    await prisma.conversation.update({ where: { id: conversationId }, data: { title } });
    yield { type: 'title' as const, title };
  }

  yield { type: 'done' as const };
}