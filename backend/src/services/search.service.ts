import { prisma } from '../config/prisma';
import { generateEmbedding } from './embedding.service';

interface SearchResult {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  filename: string;
  similarity: number;
}

export async function semanticSearch(
  userId: string,
  query: string,
  options: { workspaceId?: string; documentId?: string; topK?: number }
) {
  const { workspaceId, documentId, topK = 5 } = options;

  const queryEmbedding = await generateEmbedding(query);
  const vectorString = `[${queryEmbedding.join(',')}]`;

  let results: SearchResult[];

  if (documentId) {
    results = await prisma.$queryRaw<SearchResult[]>`
      SELECT dc.id, dc."documentId", dc."chunkIndex", dc.content, d.filename,
             1 - (dc.embedding <=> ${vectorString}::vector) AS similarity
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      JOIN "Workspace" w ON d."workspaceId" = w.id
      WHERE w."userId" = ${userId} AND dc."documentId" = ${documentId}
      ORDER BY dc.embedding <=> ${vectorString}::vector
      LIMIT ${topK}
    `;
  } else if (workspaceId) {
    results = await prisma.$queryRaw<SearchResult[]>`
      SELECT dc.id, dc."documentId", dc."chunkIndex", dc.content, d.filename,
             1 - (dc.embedding <=> ${vectorString}::vector) AS similarity
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      JOIN "Workspace" w ON d."workspaceId" = w.id
      WHERE w."userId" = ${userId} AND d."workspaceId" = ${workspaceId}
      ORDER BY dc.embedding <=> ${vectorString}::vector
      LIMIT ${topK}
    `;
  } else {
    results = await prisma.$queryRaw<SearchResult[]>`
      SELECT dc.id, dc."documentId", dc."chunkIndex", dc.content, d.filename,
             1 - (dc.embedding <=> ${vectorString}::vector) AS similarity
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      JOIN "Workspace" w ON d."workspaceId" = w.id
      WHERE w."userId" = ${userId}
      ORDER BY dc.embedding <=> ${vectorString}::vector
      LIMIT ${topK}
    `;
  }

  return results;
}