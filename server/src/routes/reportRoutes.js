const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const reportController = require('../controllers/reportController');

// @route   GET /api/reports/summary
// @desc    Retrieve overall library statistics (Admin & Librarian only)
router.get(
  '/summary',
  protect,
  role('admin', 'librarian'),
  reportController.summary
);

// @route   GET /api/reports/overdue
// @desc    Retrieve list of all overdue books (Admin & Librarian only)
router.get(
  '/overdue',
  protect,
  role('admin', 'librarian'),
  reportController.overdueBooks
);

module.exports = router;