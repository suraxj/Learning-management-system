const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Borrow = require('../models/Borrow');

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

function isDemoPaymentMode() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return (
    process.env.STRIPE_DEMO_MODE === 'true' ||
    !key ||
    key.includes('dummy') ||
    key.includes('your') ||
    key.includes('xxx') ||
    key === 'sk_test_your_key'
  );
}

async function markFinePaid({ payment, borrow }) {
  payment.status = 'paid';
  await payment.save();

  borrow.finePaid = true;
  await borrow.save();

  return payment;
}

exports.createFinePayment = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.borrowId).populate('book');

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (String(borrow.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!borrow.fine || Number(borrow.fine) <= 0) {
      return res.status(400).json({ message: 'No fine found for this borrowing' });
    }

    if (borrow.finePaid) {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    let payment = await Payment.create({
      user: req.user._id,
      borrow: borrow._id,
      amount: borrow.fine,
      status: 'pending',
    });

    // Local project/demo mode: mark paid immediately.
    // Use this while you do not have a real Stripe key + webhook configured.
    if (isDemoPaymentMode()) {
      payment = await markFinePaid({ payment, borrow });
      return res.json({
        payment,
        demo: true,
        message: 'Demo payment successful. Fine marked as paid.',
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        paymentId: String(payment._id),
        borrowId: String(borrow._id),
      },
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Library late fine - ${borrow.book?.title || 'Book'}`,
            },
            unit_amount: Math.round(Number(borrow.fine) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    res.json({ url: session.url, payment });
  } catch (error) {
    console.error('PAYMENT ERROR:', error);
    res.status(500).json({ message: error.message || 'Payment failed' });
  }
};

exports.paymentWebhook = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_DEMO_MODE === 'true') {
    return res.json({ received: true, message: 'Webhook skipped in demo mode' });
  }

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'paid' },
      { new: true }
    );

    if (payment?.borrow) {
      await Borrow.findByIdAndUpdate(payment.borrow, { finePaid: true });
    }
  }

  res.json({ received: true });
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
