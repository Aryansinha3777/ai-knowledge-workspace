import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload as uploadMiddleware } from '../config/multer';
import { upload, list, getOne, remove } from '../controllers/document.controller';
import { summarize } from '../controllers/summary.controller';

const router = Router();

router.use(authenticate);

router.post('/workspaces/:workspaceId/documents', uploadMiddleware.single('file'), upload);
router.get('/workspaces/:workspaceId/documents', list);
router.get('/documents/:id', getOne);
router.delete('/documents/:id', remove);
router.post('/documents/:id/summarize', summarize);

export default router;