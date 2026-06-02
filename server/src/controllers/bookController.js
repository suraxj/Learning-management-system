const Book = require('../models/Book');

const syncBookStatus = (payload) => {
  if (payload.availableCopies !== undefined) {
    payload.status = Number(payload.availableCopies) > 0 ? 'available' : 'unavailable';
  }
  return payload;
};

exports.createBook = async (req, res) => {
  const payload = syncBookStatus({ ...req.body });
  const book = await Book.create(payload);
  res.status(201).json({ book });
};

exports.getBooks = async (req, res) => {
  const { search, genre, status } = req.query;
  const query = {};

  if (search) {
    query.$or = ['title', 'author', 'isbn', 'genre'].map((key) => ({
      [key]: { $regex: search, $options: 'i' },
    }));
  }

  if (genre) query.genre = genre;
  if (status) query.status = status;

  const books = await Book.find(query).sort('-createdAt');
  res.json({ books });
};

exports.getBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ book });
};

exports.updateBook = async (req, res) => {
  const payload = syncBookStatus({ ...req.body });
  const book = await Book.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ book });
};

exports.deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ message: 'Book deleted' });
};
