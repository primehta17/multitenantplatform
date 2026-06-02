import Invoice from "../models/Invoice.js";

export const createInvoice = async({ userId, planId, organizationId, amount, currency, description }) =>{
  return await Invoice.create(
    { userId, planId, organizationId, amount, currency, description })
}

export const getMyInvoices = async (user) =>{
  return await Invoice.find({ userId: user.userId, organizationId: user.orgId })
  .populate('planId', 'name billingCycle')
  .sort({createdAt: -1})
}

export const getAllInvoices = async (user) => {
  return Invoice.find({ organizationId: user.orgId })
    .populate('planId', 'name billingCycle')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};


