const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const paymentController = require('../controllers/paymentController');

router.post('/borrow/:bookId', protect, paymentController.createBorrowPayment);
router.post('/fine/:borrowId', protect, paymentController.createFinePayment);
router.get('/mine', protect, paymentController.myPayments);
router.get('/', protect, role('admin', 'librarian'), paymentController.allPayments);

module.exports = router;
