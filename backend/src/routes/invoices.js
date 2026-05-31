import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import { getMyInvoices, getAllInvoices } from '../controllers/invoiceController.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMyInvoices);
router.get('/', requireRole('OrgAdmin'), getAllInvoices);

export default router;
