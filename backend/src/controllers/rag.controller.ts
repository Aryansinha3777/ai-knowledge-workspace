import { Request, Response } from 'express';
import {
  createConversation,
  getConversations,
  getConversationWithMessages,
  deleteConversation
} from '../services/conversation.service';
import { askQuestion , askQuestionStream } from '../services/rag.service';

export async function createConv(req: Request, res: Response) {
  try {
    const { title } = req.body;
    const conversation = await createConversation(
      req.userId as string,
      req.params.workspaceId as string,
      title
    );
    return res.status(201).json({ success: true, data: conversation });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function listConv(req: Request, res: Response) {
  try {
    const conversations = await getConversations(
      req.userId as string,
      req.params.workspaceId as string
    );
    return res.status(200).json({ success: true, data: conversations });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getConv(req: Request, res: Response) {
  try {
    const conversation = await getConversationWithMessages(
      req.userId as string,
      req.params.id as string
    );
    return res.status(200).json({ success: true, data: conversation });
  } catch (error: any) {
    const status = error.message === 'Conversation not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function ask(req: Request, res: Response) {
  try {
    const { question, workspaceId, documentId } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const result = await askQuestion(req.userId as string, req.params.id as string, question, {
      workspaceId,
      documentId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function askStream(req: Request, res: Response) {
  try {
    const { question, workspaceId, documentId } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const generator = askQuestionStream(
      req.userId as string,
      req.params.id as string,
      question,
      { workspaceId, documentId }
    );

    for await (const event of generator) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
}

export async function removeConv(req: Request, res: Response) {
  try {
    await deleteConversation(req.userId as string, req.params.id as string);
    return res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error: any) {
    const status = error.message === 'Conversation not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}