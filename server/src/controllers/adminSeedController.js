const User = require('../models/User');

exports.makeAdmin = async (req, res) => {
  if (!process.env.ADMIN_SETUP_SECRET || req.body.secret !== process.env.ADMIN_SETUP_SECRET) {
    return res.status(403).json({ message: 'Invalid admin setup secret' });
  }

  const user = await User.findOneAndUpdate(
    { email: String(req.body.email || '').toLowerCase().trim() },
    { role: 'admin' },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User promoted to admin', user });
};
