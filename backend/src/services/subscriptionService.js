import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';

export const getMySubscription = async (user) => {
  // findOne — user has at most one active subscription
  // .populate('planId') swaps the ObjectId for the full plan document (name, price, etc.)
  return Subscription.findOne({
    userId: user.userId,
    organizationId: user.orgId,
    status: 'active',
  }).populate('planId');
  // returns null if no active subscription — frontend handles that case
};

export const subscribe = async (planId, user) => {
  // Step 1: block if already subscribed
  const existing = await Subscription.findOne({
    userId: user.userId,
    organizationId: user.orgId,
    status: 'active',
  });
  if (existing) {
    const err = new Error('You already have an active subscription');
    err.status = 400;
    throw err;
  }

  // Step 2: verify plan exists in this org and is active
  const plan = await Plan.findOne({ _id: planId, organizationId: user.orgId, isActive: true });
  if (!plan) {
    const err = new Error('Plan not found');
    err.status = 404;
    throw err;
  }

  // Step 3: create the subscription
  return Subscription.create({
    userId: user.userId,
    planId,
    organizationId: user.orgId,
  });
};

export const changePlan = async (subscriptionId, newPlanId, user) => {
  // Subscription model — not Plan model
  const sub = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, userId: user.userId, organizationId: user.orgId, status: 'active' },
    { planId: newPlanId },
    { new: true }
  );
  if (!sub) {
    const err = new Error('Subscription not found');
    err.status = 404;
    throw err;
  }
  return sub;
};

export const cancel = async (subscriptionId, user) => {
  // filter: find the ACTIVE subscription
  // update: SET status to cancelled (not in the filter)
  const sub = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, userId: user.userId, organizationId: user.orgId, status: 'active' },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );
  if (!sub) {
    const err = new Error('Subscription not found');
    err.status = 404;
    throw err;
  }
  return sub;
};
