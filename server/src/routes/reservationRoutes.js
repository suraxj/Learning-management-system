const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const reservationController = require('../controllers/reservationController');

// @route   POST /api/reservations/:bookId
// @desc    Reserve a specific book
router.post('/:bookId', protect, reservationController.reserveBook);

// @route   GET /api/reservations/mine/list
// @desc    Retrieve the current user's reservations
router.get('/mine/list', protect, reservationController.myReservations);

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel an existing reservation
router.put('/:id/cancel', protect, reservationController.cancelReservation);

// @route   GET /api/reservations/
// @desc    Retrieve all reservations (Admin & Librarian only)
router.get(
  '/', 
  protect, 
  role('admin', 'librarian'), 
  reservationController.allReservations
);

module.exports = router;