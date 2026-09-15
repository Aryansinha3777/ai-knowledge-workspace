import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { search } from '../controllers/search.controller';

const router = Router();

router.use(authenticate);
router.get('/', search);

export default router;