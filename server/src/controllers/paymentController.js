const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing in backend .env');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const createBorrowRecordAfterPayment = async (payment, session) => {
  if (!payment || payment.status === 'paid') return;

  const bookId = session.metadata?.bookId;
  const userId = session.metadata?.userId;
  const daysRequested = Number(session.metadata?.daysRequested || 14);

  const book = await Book.findById(bookId);
  if (!book) throw new Error('Book not found after payment');
  if (book.availableCopies < 1) throw new Error('Book not available after payment');

  const activeCount = await Borrow.countDocuments({
    user: userId,
    status: { $in: ['borrowed', 'overdue'] },
  });

  const limit = Number(process.env.BORROW_LIMIT || 3);
  if (activeCount >= limit) throw new Error(`Borrow limit reached. Max ${limit} books allowed.`);

  const alreadyBorrowed = await Borrow.findOne({
    user: userId,
    book: bookId,
    status: { $in: ['borrowed', 'overdue'] },
  });

  if (alreadyBorrowed) throw new Error('User already borrowed this book');

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysRequested);

  book.availableCopies -= 1;
  await book.save();

  const borrow = await Borrow.create({
    user: userId,
    book: bookId,
    borrowDate: new Date(),
    dueDate,
    borrowDaysRequested: daysRequested,
    borrowFee: payment.amount,
    isPaid: true,
    paymentMethod: 'Stripe',
    status: 'borrowed',
  });

  payment.borrow = borrow._id;
  payment.status = 'paid';
  payment.paymentMethod = 'Stripe';
  await payment.save();
};

exports.createBorrowPayment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const daysRequested = Number(req.body.daysRequested || 7);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Please login first' });
    }

    if (daysRequested < 1 || daysRequested > 30) {
      return res.status(400).json({ message: 'Borrow days must be between 1 and 30' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book not available. You can reserve it.' });
    }

    const alreadyBorrowed = await Borrow.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['borrowed', 'overdue'] },
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: 'You already borrowed this book' });
    }

    const amount = daysRequested * Number(book.borrowPricePerDay || 20);

    const payment = await Payment.create({
      user: req.user._id,
      amount,
      status: 'pending',
      paymentType: 'borrow',
      paymentMethod: 'Stripe',
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        paymentId: String(payment._id),
        paymentType: 'borrow',
        userId: String(req.user._id),
        bookId: String(book._id),
        daysRequested: String(daysRequested),
      },
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Borrow Book - ${book.title}`,
              description: `${daysRequested} day(s) library borrowing fee`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error('BORROW PAYMENT ERROR:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment' });
  }
};

exports.createFinePayment = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId).populate('book');
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    if (String(borrow.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!borrow.fine || Number(borrow.fine) <= 0) {
      return res.status(400).json({ message: 'No fine found for this borrowing' });
    }

    if (borrow.finePaid) {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    const payment = await Payment.create({
      user: req.user._id,
      borrow: borrow._id,
      amount: borrow.fine,
      status: 'pending',
      paymentType: 'fine',
      paymentMethod: 'Stripe',
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        paymentId: String(payment._id),
        paymentType: 'fine',
        borrowId: String(borrow._id),
      },
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: `Library late fine - ${borrow.book?.title || 'Book'}` },
            unit_amount: Math.round(Number(borrow.fine) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error('FINE PAYMENT ERROR:', error);
    res.status(500).json({ message: error.message || 'Payment failed' });
  }
};

exports.paymentWebhook = async (req, res) => {
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const payment = await Payment.findOne({ stripeSessionId: session.id });

      if (payment && session.metadata?.paymentType === 'borrow') {
        await createBorrowRecordAfterPayment(payment, session);
      }

      if (payment && session.metadata?.paymentType === 'fine') {
        payment.status = 'paid';
        payment.paymentMethod = 'Stripe';
        await payment.save();

        if (payment.borrow) {
          await Borrow.findByIdAndUpdate(payment.borrow, { finePaid: true });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('WEBHOOK PROCESSING ERROR:', error);
    res.status(500).json({ received: false, message: error.message });
  }
};

exports.myPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({ path: 'borrow', populate: { path: 'book' } })
      .sort('-createdAt');

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load payments' });
  }
};

exports.allPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email role')
      .populate({ path: 'borrow', populate: { path: 'book' } })
      .sort('-createdAt');

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load payments' });
  }
};
