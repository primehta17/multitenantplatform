import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = Router();

router.get('/', authenticate, requireRole('OrgAdmin'), getAnalytics);

export default router;
