import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, orgId: user.organizationId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const registerOrg = async ({ orgName, name, email, password }) => {
  if (!password || password.length < 8) {
    const err = new Error('Password must be at least 8 characters');
    err.status = 400;
    throw err;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const err = new Error('Invalid email address');
    err.status = 400;
    throw err;
  }

  const slug = orgName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

  const org = await Organization.create({ name: orgName, slug });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'OrgAdmin',
    organizationId: org._id,
    createdBy: null,
  });

  // Link org back to its creator
  org.createdBy = user._id;
  await org.save();

  const token = signToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const match = await user.comparePassword(password);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};
