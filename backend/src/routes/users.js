import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import { getUsers, inviteUser, changeRole } from '../controllers/userController.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('OrgAdmin'));

router.get('/', getUsers);
router.post('/invite', inviteUser);
router.patch('/:id/role', changeRole);

export default router;
