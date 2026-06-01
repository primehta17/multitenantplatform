import * as analyticsService from '../services/analyticsService.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getAnalytics(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
