import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createConv, listConv, getConv, ask } from '../controllers/rag.controller';

const router = Router();

router.use(authenticate);

router.post('/workspaces/:workspaceId/conversations', createConv);
router.get('/workspaces/:workspaceId/conversations', listConv);
router.get('/conversations/:id', getConv);
router.post('/conversations/:id/messages', ask);

export default router;