const Review = require('../models/Review');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
async function updateAverage(bookId){ const rs = await Review.find({ book: bookId, isApproved: true }); const avg = rs.length ? rs.reduce((s,r)=>s+r.rating,0)/rs.length : 0; await Book.findByIdAndUpdate(bookId,{averageRating:Number(avg.toFixed(1))}); }
exports.createReview = async (req, res) => {
  const borrowed = await Borrow.findOne({ user: req.user._id, book: req.params.bookId, status: 'returned' });
  if (!borrowed) return res.status(400).json({ message: 'You can review only after borrowing and returning this book' });
  const review = await Review.create({ user: req.user._id, book: req.params.bookId, rating: req.body.rating, comment: req.body.comment });
  await updateAverage(req.params.bookId); res.status(201).json({ review });
};
exports.getBookReviews = async (req, res) => res.json({ reviews: await Review.find({ book: req.params.bookId, isApproved: true }).populate('user','name').sort('-createdAt') });
exports.allReviews = async (req, res) => res.json({ reviews: await Review.find().populate('user book').sort('-createdAt') });
exports.updateReviewStatus = async (req, res) => { const review = await Review.findById(req.params.id); if(!review) return res.status(404).json({message:'Review not found'}); review.isApproved = req.body.isApproved; await review.save(); await updateAverage(review.book); res.json({ review }); };
exports.deleteReview = async (req, res) => { const review = await Review.findByIdAndDelete(req.params.id); if(!review) return res.status(404).json({message:'Review not found'}); await updateAverage(review.book); res.json({message:'Review deleted'}); };
