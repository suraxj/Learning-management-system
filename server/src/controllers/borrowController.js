const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const sendEmail = require('../config/mailer');

exports.borrowBook = async (req, res) => {
  const activeCount = await Borrow.countDocuments({ user: req.user._id, status: { $in: ['borrowed', 'overdue'] } });
  const limit = Number(process.env.BORROW_LIMIT || 3);

  if (activeCount >= limit) {
    return res.status(400).json({ message: `Borrow limit reached. Max ${limit} books allowed.` });
  }

  const alreadyBorrowed = await Borrow.findOne({ user: req.user._id, book: req.params.bookId, status: { $in: ['borrowed', 'overdue'] } });
  if (alreadyBorrowed) return res.status(400).json({ message: 'You already borrowed this book' });

  const book = await Book.findById(req.params.bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.availableCopies < 1) return res.status(400).json({ message: 'Book not available. You can reserve it.' });

  const daysRequested = Number(req.body.daysRequested || 14);
  const paymentMethod = req.body.paymentMethod || 'None';
  const borrowFee = daysRequested * (book.borrowPricePerDay || 20);

  book.availableCopies -= 1;
  await book.save();

  const dueDate = new Date(Date.now() + daysRequested * 24 * 60 * 60 * 1000);
  const borrow = await Borrow.create({
    user: req.user._id,
    book: book._id,
    dueDate,
    borrowDaysRequested: daysRequested,
    borrowFee,
    isPaid: true,
    paymentMethod,
  });

  // Also create a successful payment record for this borrowing
  const Payment = require('../models/Payment');
  await Payment.create({
    user: req.user._id,
    borrow: borrow._id,
    amount: borrowFee,
    status: 'paid',
    paymentType: 'borrow',
    paymentMethod,
  });

  res.status(201).json({ borrow });
};

exports.returnBook = async (req, res) => {
  const borrow = await Borrow.findById(req.params.borrowId).populate('book user');
  if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

  if (borrow.status === 'returned') {
    return res.status(400).json({ message: 'This book is already returned' });
  }

  if (String(borrow.user._id) !== String(req.user._id) && !['admin', 'librarian'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const now = new Date();
  let fine = 0;
  if (now > borrow.dueDate) {
    fine = Math.ceil((now - borrow.dueDate) / (24 * 60 * 60 * 1000)) * Number(process.env.FINE_PER_DAY || 10);
  }

  borrow.returnDate = now;
  borrow.fine = fine;
  borrow.status = 'returned';
  await borrow.save();

  borrow.book.availableCopies += 1;
  await borrow.book.save();

  const reservation = await Reservation.findOne({ book: borrow.book._id, status: 'active' }).sort('createdAt').populate('user book');
  if (reservation) {
    reservation.status = 'available';
    reservation.notifiedAt = new Date();
    await reservation.save();

    await Notification.create({
      user: reservation.user._id,
      title: 'Reserved book available',
      message: `${reservation.book.title} is now available.`,
      type: 'reservation',
    });

    await sendEmail({
      to: reservation.user.email,
      subject: 'Reserved book available',
      html: `<p>${reservation.book.title} is now available.</p>`,
    });
  }

  res.json({ borrow, fine });
};

const updateOverdueFines = async (borrowings) => {
  const now = new Date();
  const finePerDay = Number(process.env.FINE_PER_DAY || 10);

  for (const b of borrowings) {
    if (b.status !== 'returned') {
      let isChanged = false;
      if (now > b.dueDate) {
        if (b.status !== 'overdue') {
          b.status = 'overdue';
          isChanged = true;
        }
        const overdueDays = Math.ceil((now - b.dueDate) / (24 * 60 * 60 * 1000));
        const expectedFine = overdueDays * finePerDay;
        if (b.fine !== expectedFine) {
          b.fine = expectedFine;
          isChanged = true;
        }
      }
      if (isChanged) {
        await b.save();
      }
    }
  }
};

exports.myBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrow.find({ user: req.user._id }).populate('book').sort('-createdAt');
    await updateOverdueFines(borrowings);
    res.json({ borrowings });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load user borrowings' });
  }
};

exports.allBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrow.find().populate('user book').sort('-createdAt');
    await updateOverdueFines(borrowings);
    res.json({ borrowings });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load borrowings' });
  }
};
