const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const reviewController = require('../controllers/reviewController');

// @route   POST /api/reviews/:bookId
// @desc    Post a new review for a book
router.post('/:bookId', protect, reviewController.createReview);

// @route   GET /api/reviews/book/:bookId
// @desc    Retrieve all approved reviews for a specific book
router.get('/book/:bookId', reviewController.getBookReviews);

// @route   GET /api/reviews/
// @desc    Retrieve all reviews (Admin & Librarian only)
router.get(
  '/', 
  protect, 
  role('admin', 'librarian'), 
  reviewController.allReviews
);

// @route   PUT /api/reviews/:id/status
// @desc    Update the approval status of a review (Admin & Librarian only)
router.put(
  '/:id/status', 
  protect, 
  role('admin', 'librarian'), 
  reviewController.updateReviewStatus
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (Admin & Librarian only)
router.delete(
  '/:id', 
  protect, 
  role('admin', 'librarian'), 
  reviewController.deleteReview
);

module.exports = router;