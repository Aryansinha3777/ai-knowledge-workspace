import { prisma } from '../config/prisma';
import { getWorkspaceById } from './workspace.service';

export async function createConversation(userId: string, workspaceId: string, title?: string) {
  await getWorkspaceById(userId, workspaceId);

  const conversation = await prisma.conversation.create({
    data: { workspaceId, title },
  });

  return conversation;
}

export async function getConversations(userId: string, workspaceId: string) {
  await getWorkspaceById(userId, workspaceId);

  const conversations = await prisma.conversation.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations;
}

export async function getConversationWithMessages(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      workspace: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.workspace.userId !== userId) {
    throw new Error('Not authorized to access this conversation');
  }

  return conversation;
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conversation = await getConversationWithMessages(userId, conversationId);
  await prisma.conversation.delete({ where: { id: conversation.id } });
}