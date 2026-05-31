import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { getMySubscription, subscribe, changePlan, cancel } from '../controllers/subscriptionController.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMySubscription);
router.post('/', subscribe);
router.put('/:id', changePlan);
router.delete('/:id', cancel);

export default router;
