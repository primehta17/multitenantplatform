import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import { getPlans, createPlan, updatePlan, deactivatePlan } from '../controllers/planController.js';

const router = Router();

router.use(authenticate);

router.get('/', getPlans);
router.post('/', requireRole('OrgAdmin'), createPlan);
router.put('/:id', requireRole('OrgAdmin'), updatePlan);
router.patch('/:id/deactivate', requireRole('OrgAdmin'), deactivatePlan);

export default router;
