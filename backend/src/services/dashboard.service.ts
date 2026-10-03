import { prisma } from '../config/prisma';

export async function getDashboardStats(userId: string) {
  const [workspaceCount, documentCount, conversationCount, recentDocuments, recentConversations] =
    await Promise.all([
      prisma.workspace.count({ where: { userId } }),
      prisma.document.count({ where: { workspace: { userId } } }),
      prisma.conversation.count({ where: { workspace: { userId } } }),
      prisma.document.findMany({
        where: { workspace: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          filename: true,
          status: true,
          createdAt: true,
          workspaceId: true,
          workspace: { select: { name: true } },
        },
      }),
      prisma.conversation.findMany({
        where: { workspace: { userId } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          workspaceId: true,
          workspace: { select: { name: true } },
        },
      }),
    ]);

  return {
    counts: { workspaces: workspaceCount, documents: documentCount, conversations: conversationCount },
    recentDocuments,
    recentConversations,
  };
}