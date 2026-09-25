import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createConv, listConv, getConv, ask, askStream, removeConv } from '../controllers/rag.controller';
import { validate } from '../middleware/validate.middleware';
import { askQuestionSchema } from '../validators/rag.validator';

const router = Router();

router.use(authenticate);

router.post('/workspaces/:workspaceId/conversations', createConv);
router.get('/workspaces/:workspaceId/conversations', listConv);
router.get('/conversations/:id', getConv);
router.post('/conversations/:id/messages', validate(askQuestionSchema), ask);
router.post('/conversations/:id/messages/stream', validate(askQuestionSchema), askStream);
router.delete('/conversations/:id', removeConv);

export default router;