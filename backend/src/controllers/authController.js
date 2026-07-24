const jwt = require('jsonwebtoken');
const User = require('../models/mongodb/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res, next) => {
  try {
    const { email, password, name, title, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      email,
      passwordHash: await User.hashPassword(password),
      name,
      title,
      role: role || 'clinician',
    });

    res.status(201).json({ success: true, token: signToken(user), user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ success: true, token: signToken(user), user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
