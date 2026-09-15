import { Request, Response } from 'express';
import { semanticSearch } from '../services/search.service';

export async function search(req: Request, res: Response) {
  try {
    const { query, workspaceId, documentId } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    const results = await semanticSearch(req.userId as string, query, {
      workspaceId: typeof workspaceId === 'string' ? workspaceId : undefined,
      documentId: typeof documentId === 'string' ? documentId : undefined,
    });

    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}