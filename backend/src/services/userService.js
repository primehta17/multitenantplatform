import User from '../models/User.js';

export const getOrgUsers = async (user) => {
  return User.find({ organizationId: user.orgId }).select('-passwordHash').sort({ createdAt: -1 });
};

export const inviteUser = async ({ email, name }, user) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.status = 409;
    throw err;
  }
  return User.create({
    name: name || email.split('@')[0],
    email,
    role: 'OrgMember',
    status: 'invited',
    organizationId: user.orgId,
    createdBy: user.userId,
  });
};

export const changeUserRole = async (userId, role, user) => {
  const updated = await User.findOneAndUpdate(
    { _id: userId, organizationId: user.orgId },
    { role, updatedBy: user.userId },
    { new: true }
  ).select('-passwordHash');
  if (!updated) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return updated;
};
