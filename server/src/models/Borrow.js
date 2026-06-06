const mongoose = require('mongoose');
const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  fine: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' },
  borrowFee: { type: Number, default: 0 },
  borrowDaysRequested: { type: Number, default: 14 },
  isPaid: { type: Boolean, default: false },
  paymentMethod: { type: String, default: 'None' },
}, { timestamps: true });
module.exports = mongoose.model('Borrow', borrowSchema);
