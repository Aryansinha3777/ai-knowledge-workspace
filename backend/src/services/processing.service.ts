import { prisma } from '../config/prisma';
import { extractText } from '../utils/extraction';
import { cleanText, chunkText } from '../utils/chunking';
import { generateEmbedding } from './embedding.service';

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

    for (let i = 0; i < chunks.length; i++) {
  const content = chunks[i];
  const embedding = await generateEmbedding(content);

  await prisma.$executeRaw`
    INSERT INTO "DocumentChunk" (id, "documentId", "chunkIndex", content, embedding, "createdAt")
    VALUES (gen_random_uuid(), ${documentId}, ${i}, ${content}, ${embedding}::vector, now())
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