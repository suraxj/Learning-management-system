const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const paymentController = require('../controllers/paymentController');

// @route   POST /api/payments/fine/:borrowId
// @desc    Initiate a fine payment for a specific borrowing record
router.post('/fine/:borrowId', protect, paymentController.createFinePayment);

// @route   GET /api/payments/mine
// @desc    Retrieve payment history for the authenticated user
router.get('/mine', protect, paymentController.myPayments);

// @route   GET /api/payments/
// @desc    Retrieve all payment records (Admin & Librarian only)
router.get(
  '/', 
  protect, 
  role('admin', 'librarian'), 
  paymentController.allPayments
);

module.exports = router;