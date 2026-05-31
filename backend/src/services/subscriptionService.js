import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import { createInvoice } from './invoiceService.js';

export const getMySubscription = async (user) => {
  return Subscription.findOne({
    userId: user.userId,
    organizationId: user.orgId,
    status: 'active',
  }).populate('planId');
};

export const subscribe = async (planId, user) => {
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

  const plan = await Plan.findOne({ _id: planId, organizationId: user.orgId, isActive: true });
  if (!plan) {
    const err = new Error('Plan not found');
    err.status = 404;
    throw err;
  }

  const sub = await Subscription.create({
    userId: user.userId,
    planId,
    organizationId: user.orgId,
  });

  await createInvoice({
    userId: user.userId,
    planId: plan._id,
    organizationId: user.orgId,
    amount: plan.price,
    currency: 'USD',
    description: `Subscribed to ${plan.name}`,
  });

  return sub;
};

export const changePlan = async (subscriptionId, newPlanId, user) => {
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

  const plan = await Plan.findById(newPlanId);
  if (plan) {
    await createInvoice({
      userId: user.userId,
      planId: newPlanId,
      organizationId: user.orgId,
      amount: plan.price,
      currency: 'USD',
      description: `Switched to ${plan.name}`,
    });
  }

  return sub;
};

export const cancel = async (subscriptionId, user) => {
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

  await createInvoice({
    userId: user.userId,
    planId: sub.planId,
    organizationId: user.orgId,
    amount: 0,
    currency: 'USD',
    description: 'Subscription cancelled',
  });

  return sub;
};
