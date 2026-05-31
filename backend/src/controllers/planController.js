import * as planService from '../services/planService.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = await planService.getPlans(req.user.orgId);
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const plan = await planService.createPlan(req.body, req.user);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await planService.updatePlan(req.params.id, req.body, req.user);
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

export const deactivatePlan = async (req, res, next) => {
  try {
    const plan = await planService.deactivatePlan(req.params.id, req.user);
    res.json(plan);
  } catch (err) {
    next(err);
  }
};
