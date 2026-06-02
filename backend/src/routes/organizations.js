import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import Organization from '../models/Organization.js';

const router = Router();

router.patch('/currency', authenticate, requireRole('OrgAdmin'), async (req, res, next) => {
  try {
    const { currency } = req.body;
    const allowed = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED'];
    if (!allowed.includes(currency)) {
      return res.status(400).json({ message: 'Unsupported currency' });
    }
    const org = await Organization.findByIdAndUpdate(
      req.user.orgId,
      { preferredCurrency: currency },
      { new: true }
    );
    res.json({ preferredCurrency: org.preferredCurrency });
  } catch (err) {
    next(err);
  }
});

export default router;
