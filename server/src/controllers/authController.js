const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const sendEmail = require('../config/mailer');

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });

    res.status(201).json({ token: tokenFor(user._id), user: userPayload(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Register failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ token: tokenFor(user._id), user: userPayload(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

exports.me = async (req, res) => {
  const borrowings = await Borrow.find({ user: req.user._id }).populate('book').sort('-createdAt');
  const reservations = await Reservation.find({ user: req.user._id }).populate('book').sort('-createdAt');
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt');
  res.json({ user: req.user, borrowings, reservations, notifications });
};

exports.updateProfile = async (req, res) => {
  ['name', 'phone', 'address'].forEach((key) => {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  });

  await req.user.save();
  res.json({ user: req.user });
};

exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(req.body.oldPassword))) {
    return res.status(400).json({ message: 'Old password is incorrect' });
  }

  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully' });
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: 'No account found with this email' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password reset request',
    html: `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 15 minutes.</p>`,
  });

  res.json({ message: 'Password reset email sent' });
};

exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};
