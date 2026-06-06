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

// @route   POST /api/notifications/send
// @desc    Send direct notification to a specific user (Admin & Librarian only)
router.post('/send', protect, role('admin', 'librarian'), notificationController.sendDirect);

// @route   GET /api/notifications/sent
// @desc    Get all sent notifications (Admin & Librarian only)
router.get('/sent', protect, role('admin', 'librarian'), notificationController.allNotifications);

// @route   DELETE /api/notifications/:id
// @desc    Delete a sent notification (Admin & Librarian only)
router.delete('/:id', protect, role('admin', 'librarian'), notificationController.deleteNotification);

module.exports = router;