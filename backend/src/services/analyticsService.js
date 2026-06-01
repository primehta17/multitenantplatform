import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import Organization from '../models/Organization.js';
import { convertCurrency } from './currencyService.js';

export const getAnalytics = async (user) => {
  const orgId = new mongoose.Types.ObjectId(user.orgId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [subscribersByPlan, mrrData, churnData, trendData, org] = await Promise.all([

    // 1. Active subscribers grouped by plan name
    Subscription.aggregate([
      { $match: { organizationId: orgId, status: 'active' } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: '$plan.name', count: { $sum: 1 } } },
      { $project: { _id: 0, plan: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),

    // 2. MRR - sum of all active plan prices
    Subscription.aggregate([
      { $match: { organizationId: orgId, status: 'active' } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: null, total: { $sum: '$plan.price' } } },
    ]),

    // 3. Churn - cancellations in last 30 days
    Subscription.countDocuments({
      organizationId: orgId,
      status: 'cancelled',
      cancelledAt: { $gte: thirtyDaysAgo },
    }),

    // 4. Monthly trend - subscriber count per month for last 6 months
    Subscription.aggregate([
      { $match: { organizationId: orgId, startDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$startDate' }, month: { $month: '$startDate' } },
          newSubscribers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' }, '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
            ],
          },
          newSubscribers: 1,
        },
      },
    ]),

    // 5. Org preferred currency
    Organization.findById(orgId).select('preferredCurrency'),
  ]);

  const rawMrr = mrrData[0]?.total || 0;
  const preferredCurrency = org?.preferredCurrency || 'USD';
  const convertedMrr = await convertCurrency(rawMrr, 'USD', preferredCurrency);

  const totalActiveSubscribers = subscribersByPlan.reduce((sum, p) => sum + p.count, 0);

  return {
    totalActiveSubscribers,
    subscribersByPlan,
    mrr: convertedMrr,
    churnLast30Days: churnData,
    monthlyTrend: trendData,
  };
};
