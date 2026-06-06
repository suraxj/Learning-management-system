const Notification = require('../models/Notification');
const User = require('../models/User');
exports.myNotifications = async (req, res) => res.json({ notifications: await Notification.find({ user: req.user._id }).sort('-createdAt') });
exports.markRead = async (req, res) => res.json({ notification: await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true }) });
exports.announce = async (req, res) => { const users = await User.find({}, '_id'); await Notification.insertMany(users.map(u => ({ user: u._id, title: req.body.title, message: req.body.message, type: 'announcement' }))); res.json({ message: 'Announcement sent' }); };

exports.sendDirect = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'User, title, and message are required' });
    }
    const notif = await Notification.create({
      user: userId,
      title,
      message,
      type: 'announcement',
    });
    res.status(201).json({ notification: notif });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to send notification' });
  }
};

exports.allNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch sent notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete notification' });
  }
};
