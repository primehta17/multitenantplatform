import Plan from '../models/Plan.js';

export const getPlans = async (orgId) => {
  return Plan.find({ organizationId: orgId });
};

export const createPlan = async (body, user) => {
  return Plan.create({
    ...body,
    organizationId: user.orgId,
    createdBy: user.userId,
  });
};

export const updatePlan = async (planId, body, user) => {
  const plan = await Plan.findOneAndUpdate(
    { _id: planId, organizationId: user.orgId },  
    { ...body, updatedBy: user.userId },          
    { new: true }                                  
  );
  if (!plan) {
    const err = new Error('Plan not found');
    err.status = 404;
    throw err;
  }
  return plan;
};

export const deactivatePlan = async (planId, user) => {
  const plan = await Plan.findOneAndUpdate(
    { _id: planId, organizationId: user.orgId },  
    { isActive: false, updatedBy: user.userId },   
    { new: true }
  );
  if (!plan) {
    const err = new Error('Plan not found');
    err.status = 404;
    throw err;
  }
  return plan;
};
