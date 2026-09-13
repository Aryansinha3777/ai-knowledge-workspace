import { prisma } from '../config/prisma';
import { extractText } from '../utils/extraction';
import { cleanText, chunkText } from '../utils/chunking';

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

    await prisma.documentChunk.createMany({
      data: chunks.map((content, index) => ({
        documentId,
        chunkIndex: index,
        content,
      })),
    });

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