const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications/mine
// @desc    Retrieve all notifications for the authenticated user
router.get('/mine', protect, notificationController.myNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a specific notification as read
router.put('/:id/read', protect, notificationController.markRead);

// @route   POST /api/notifications/announce
// @desc    Send a global announcement (Admin only)
router.post(
  '/announce', 
  protect, 
  role('admin'), 
  notificationController.announce
);

module.exports = router;