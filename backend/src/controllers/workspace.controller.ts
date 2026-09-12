import { Request, Response } from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from '../services/workspace.service';

export async function create(req: Request, res: Response) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name is required' });
    }

    const workspace = await createWorkspace(req.userId as string, name);

    return res.status(201).json({ success: true, data: workspace });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const workspaces = await getWorkspaces(req.userId as string);
    return res.status(200).json({ success: true, data: workspaces });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const workspace = await getWorkspaceById(req.userId as string, req.params.id as string);
    return res.status(200).json({ success: true, data: workspace });
  } catch (error: any) {
    const status = error.message === 'Workspace not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name is required' });
    }

    const workspace = await updateWorkspace(req.userId as string, req.params.id as string, name);
    return res.status(200).json({ success: true, data: workspace });
  } catch (error: any) {
    const status = error.message === 'Workspace not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await deleteWorkspace(req.userId as string, req.params.id as string);
    return res.status(200).json({ success: true, message: 'Workspace deleted' });
  } catch (error: any) {
    const status = error.message === 'Workspace not found' ? 404 : 403;
    return res.status(status).json({ success: false, message: error.message });
  }
}