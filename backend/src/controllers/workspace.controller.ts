import { Request, Response } from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from '../services/workspace.service';
import { asyncHandler } from '../utils/asyncHandler';

export async function create(req: Request, res: Response) {
  try {
    const { name } = req.body;


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

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await getWorkspaceById(req.userId as string, req.params.id as string);
  return res.status(200).json({ success: true, data: workspace });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const workspace = await updateWorkspace(req.userId as string, req.params.id as string, name);
  return res.status(200).json({ success: true, data: workspace });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteWorkspace(req.userId as string, req.params.id as string);
  return res.status(200).json({ success: true, message: 'Workspace deleted' });
});