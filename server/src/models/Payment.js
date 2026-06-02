const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow' },
  amount: { type: Number, required: true },
  stripeSessionId: String,
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);
