const Book = require('../models/Book');
const Reservation = require('../models/Reservation');
exports.reserveBook = async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const existing = await Reservation.findOne({ user: req.user._id, book: book._id, status: { $in: ['active','available'] } });
  if (existing) return res.status(400).json({ message: 'You already reserved this book' });
  res.status(201).json({ reservation: await Reservation.create({ user: req.user._id, book: book._id }) });
};
exports.myReservations = async (req, res) => res.json({ reservations: await Reservation.find({ user: req.user._id }).populate('book').sort('-createdAt') });
exports.cancelReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
  if (String(reservation.user) !== String(req.user._id) && !['admin','librarian'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
  reservation.status = 'cancelled'; await reservation.save(); res.json({ reservation });
};
exports.allReservations = async (req, res) => res.json({ reservations: await Reservation.find().populate('user book').sort('-createdAt') });
