import { Request, Response } from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from '../services/document.service';
import { processDocument } from '../services/processing.service';

export async function upload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const document = await createDocument(
      req.userId as string,
      req.params.workspaceId as string,
      req.file
    );

    processDocument(document.id).catch((err) => {
      console.error(`Processing failed for document ${document.id}:`, err.message);
    });

    return res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const documents = await getDocuments(req.userId as string, req.params.workspaceId as string);
    return res.status(200).json({ success: true, data: documents });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const document = await getDocumentById(req.userId as string, req.params.id as string);
    return res.status(200).json({ success: true, data: document });
  } catch (error: any) {
    const status = error.message === 'Document not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await deleteDocument(req.userId as string, req.params.id as string);
    return res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    const status = error.message === 'Document not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}