import { prisma } from '../config/prisma';
import { getDocumentById } from './document.service';
import { generateSummary } from './llm.service';

export async function summarizeDocument(userId: string, documentId: string) {
  const document = await getDocumentById(userId, documentId);

  if (document.status !== 'COMPLETED') {
    throw new Error('Document is not fully processed yet');
  }

  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: 'asc' },
  });

  if (chunks.length === 0) {
    throw new Error('No content available to summarize');
  }

  const fullText = chunks.map((c) => c.content).join('\n\n');

  const summary = await generateSummary(fullText);

  return {
    documentId,
    filename: document.filename,
    summary,
  };
}