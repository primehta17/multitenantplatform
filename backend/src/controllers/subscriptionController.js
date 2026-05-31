import * as subscriptionService from '../services/subscriptionService.js';

export const getMySubscription = async (req, res, next) => {
  try {
    const sub = await subscriptionService.getMySubscription(req.user);
    res.json(sub);
  } catch (err) {
    next(err);
  }
};

export const subscribe = async (req, res, next) => {
  try {
    const sub = await subscriptionService.subscribe(req.body.planId, req.user);
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
};

export const changePlan = async (req, res, next) => {
  try {
    const sub = await subscriptionService.changePlan(req.params.id, req.body.planId, req.user);
    res.json(sub);
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const sub = await subscriptionService.cancel(req.params.id, req.user);
    res.json(sub);
  } catch (err) {
    next(err);
  }
};
