const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
exports.summary = async (req, res) => {
  const [totalBooks,totalUsers,borrowed,overdue,reservations,reviews,paidPayments,inventory,borrowingStats,userActivity] = await Promise.all([
    Book.countDocuments(), User.countDocuments(), Borrow.countDocuments({status:{$in:['borrowed','overdue']}}), Borrow.countDocuments({status:'overdue'}), Reservation.countDocuments({status:{$in:['active','available']}}), Review.countDocuments(),
    Payment.aggregate([{ $match:{status:'paid'} }, { $group:{ _id:null, total:{ $sum:'$amount' } } }]),
    Book.aggregate([{ $group:{ _id:'$genre', totalCopies:{ $sum:'$copies' }, availableCopies:{ $sum:'$availableCopies' } } }, { $sort:{totalCopies:-1} }]),
    Borrow.aggregate([{ $group:{ _id:'$status', count:{ $sum:1 }, fines:{ $sum:'$fine' } } }]),
    Borrow.aggregate([{ $group:{ _id:'$user', totalBorrowed:{ $sum:1 } } }, { $sort:{totalBorrowed:-1} }, { $limit:10 }, { $lookup:{ from:'users', localField:'_id', foreignField:'_id', as:'user' } }, { $unwind:'$user' }, { $project:{ totalBorrowed:1, name:'$user.name', email:'$user.email' } }])
  ]);
  res.json({ totalBooks,totalUsers,borrowed,overdue,reservations,reviews,totalFineCollected:paidPayments[0]?.total || 0,inventory,borrowingStats,userActivity });
};
exports.overdueBooks = async (req, res) => res.json({ records: await Borrow.find({ status: 'overdue' }).populate('user book').sort('dueDate') });
