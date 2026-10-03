import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getDashboardStats } from '../services/dashboard.service';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getDashboardStats(req.userId as string);
  return res.status(200).json({ success: true, data: stats });
});