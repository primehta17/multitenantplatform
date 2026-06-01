import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getOrgUsers = async (user) => {
  return User.find({ organizationId: user.orgId }).select('-passwordHash').sort({ createdAt: -1 });
};

export const inviteUser = async ({ email, name, password }, user) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  return User.create({
    name: name || email.split('@')[0],
    email,
    passwordHash,
    role: 'OrgMember',
    status: 'active',
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
