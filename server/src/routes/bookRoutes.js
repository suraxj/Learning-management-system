const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const bookController = require('../controllers/bookController');

// @route   GET /api/books
// @desc    Get all books
router.get('/', bookController.getBooks);

// @route   GET /api/books/:id
// @desc    Get book by ID
router.get('/:id', bookController.getBook);

// @route   POST /api/books
// @desc    Create a new book (Admin & Librarian only)
router.post(
  '/', 
  protect, 
  role('admin', 'librarian'), 
  bookController.createBook
);

// @route   PUT /api/books/:id
// @desc    Update a book (Admin & Librarian only)
router.put(
  '/:id', 
  protect, 
  role('admin', 'librarian'), 
  bookController.updateBook
);

// @route   DELETE /api/books/:id
// @desc    Delete a book (Admin only)
router.delete(
  '/:id', 
  protect, 
  role('admin'), 
  bookController.deleteBook
);

module.exports = router;