import { prisma } from '../config/prisma';
import { extractText } from '../utils/extraction';
import { cleanText, chunkText } from '../utils/chunking';
import { generateEmbeddings } from './embedding.service';
import { Prisma } from '@prisma/client';

export async function processDocument(documentId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });

  if (!document) {
    throw new Error('Document not found');
  }

  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    const rawText = await extractText(document.filePath, document.fileType);
    const cleanedText = cleanText(rawText);
    const chunks = chunkText(cleanedText);

    if (chunks.length === 0) {
      throw new Error('No extractable text found in document');
    }
     const BATCH_SIZE = 50;

for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  const embeddings = await generateEmbeddings(batch);

  const rows = batch.map((content, idx) => {
    const chunkIndex = i + idx;
    const embedding = embeddings[idx];
    return Prisma.sql`(gen_random_uuid(), ${documentId}, ${chunkIndex}, ${content}, ${embedding}::vector, now())`;
  });

  await prisma.$executeRaw`
    INSERT INTO "DocumentChunk" (id, "documentId", "chunkIndex", content, embedding, "createdAt")
    VALUES ${Prisma.join(rows)}
  `;
}
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}