import { prisma } from '../config/prisma';
import { getWorkspaceById } from './workspace.service';
import path from 'path';
import fs from 'fs';

export async function createDocument(
  userId: string,
  workspaceId: string,
  file: Express.Multer.File
) {
  // verify the workspace belongs to this user before attaching a document to it
  await getWorkspaceById(userId, workspaceId);

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  const document = await prisma.document.create({
    data: {
      filename: file.originalname,
      fileType: ext,
      fileSize: file.size,
      filePath: file.path,
      workspaceId,
      status: 'PENDING',
    },
  });

  return document;
}

export async function getDocuments(userId: string, workspaceId: string) {
  await getWorkspaceById(userId, workspaceId);

  const documents = await prisma.document.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return documents;
}

export async function getDocumentById(userId: string, documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { workspace: true },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.workspace.userId !== userId) {
    throw new Error('Not authorized to access this document');
  }

  return document;
}

export async function deleteDocument(userId: string, documentId: string) {
  const document = await getDocumentById(userId, documentId);

  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  await prisma.document.delete({ where: { id: documentId } });
}