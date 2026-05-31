const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error('Forbidden: insufficient permissions');
      err.status = 403;
      return next(err);
    }
    next();
  };
};

export default requireRole;
