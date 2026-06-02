const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const borrowController = require('../controllers/borrowController');

// @route   POST /api/borrowings/:bookId/borrow
// @desc    Borrow a book
router.post('/:bookId/borrow', protect, borrowController.borrowBook);

// @route   PUT /api/borrowings/:borrowId/return
// @desc    Return a borrowed book
router.put('/:borrowId/return', protect, borrowController.returnBook);

// @route   GET /api/borrowings/mine
// @desc    Get current user's borrowings
router.get('/mine', protect, borrowController.myBorrowings);

// @route   GET /api/borrowings/
// @desc    Get all borrowings (Admin & Librarian only)
router.get(
  '/', 
  protect, 
  role('admin', 'librarian'), 
  borrowController.allBorrowings
);

module.exports = router;