import { z } from 'zod';

export const askQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required').max(2000, 'Question is too long'),
  workspaceId: z.string().uuid('Invalid workspace ID').optional(),
  documentId: z.string().uuid('Invalid document ID').optional(),
});