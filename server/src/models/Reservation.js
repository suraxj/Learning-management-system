const mongoose = require('mongoose');
const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { type: String, enum: ['active', 'available', 'cancelled', 'fulfilled'], default: 'active' },
  notifiedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('Reservation', reservationSchema);
