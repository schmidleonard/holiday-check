const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, userName: user.userName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.registerUser = async (req, res) => {
  const { userName, email, userPwd, role} = req.body;
  if (!userName || !email || !userPwd || !role) return res.status(400).json({ message: 'Missing fields' });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: 'User already exists' });

  const hashedPwd = await bcrypt.hash(userPwd, 10);
  const user = await User.create({ userName, email, userPwd: hashedPwd, role });

  res.status(201).json({ token: generateToken(user) });
};

exports.loginUser = async (req, res) => {
  const { email, userPwd } = req.body;
  const user = await User.findOne({ email }).select('+userPwd');

  if (!user || !(await bcrypt.compare(userPwd, user.userPwd)))
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: generateToken(user) });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-userPwd');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
