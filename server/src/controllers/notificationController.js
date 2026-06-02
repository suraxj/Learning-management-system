const Notification = require('../models/Notification');
const User = require('../models/User');
exports.myNotifications = async (req, res) => res.json({ notifications: await Notification.find({ user: req.user._id }).sort('-createdAt') });
exports.markRead = async (req, res) => res.json({ notification: await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true }) });
exports.announce = async (req, res) => { const users = await User.find({}, '_id'); await Notification.insertMany(users.map(u => ({ user: u._id, title: req.body.title, message: req.body.message, type: 'announcement' }))); res.json({ message: 'Announcement sent' }); };
