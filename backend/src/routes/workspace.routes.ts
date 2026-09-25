import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { create, list, getOne, update, remove } from '../controllers/workspace.controller';
import { validate } from '../middleware/validate.middleware';
import { createWorkspaceSchema } from '../validators/workspace.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createWorkspaceSchema), create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', validate(createWorkspaceSchema), update);
router.delete('/:id', remove);

export default router;