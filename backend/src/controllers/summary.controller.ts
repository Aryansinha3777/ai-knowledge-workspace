import { Request, Response } from 'express';
import { summarizeDocument } from '../services/summary.service';

export async function summarize(req: Request, res: Response) {
  try {
    const result = await summarizeDocument(req.userId as string, req.params.id as string);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}