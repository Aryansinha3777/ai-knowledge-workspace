import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function createWorkspace(userId: string, name: string) {
  const workspace = await prisma.workspace.create({
    data: {
      name,
      userId,
    },
  });

  return workspace;
}

export async function getWorkspaces(userId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return workspaces;
}

export async function getWorkspaceById(userId: string, workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  if (workspace.userId !== userId) {
    throw new AppError('Not authorized to access this workspace', 403);
  }

  return workspace;
}

export async function updateWorkspace(userId: string, workspaceId: string, name: string) {
  await getWorkspaceById(userId, workspaceId); // reuses ownership check

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  return workspace;
}

export async function deleteWorkspace(userId: string, workspaceId: string) {
  await getWorkspaceById(userId, workspaceId); // reuses ownership check

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });
}