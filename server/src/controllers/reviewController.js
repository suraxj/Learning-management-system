const Review = require("../models/Review");
const Borrow = require("../models/Borrow");
const Book = require("../models/Book");

const updateAverage = async (bookId) => {
  const reviews = await Review.find({
    book: bookId,
    isApproved: true,
  });

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;

  await Book.findByIdAndUpdate(bookId, {
    averageRating: Number(avg.toFixed(1)),
  });
};

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }

    const borrowed = await Borrow.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ["borrowed", "returned", "overdue"] },
    });

    if (!borrowed) {
      return res.status(400).json({
        message: "You can review only books you have borrowed",
      });
    }

    const existing = await Review.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already reviewed this book",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating: Number(rating),
      comment,
      isApproved: true,
    });

    await updateAverage(bookId);

    res.status(201).json({
      message: "Review posted successfully",
      review,
    });
  } catch (error) {
    console.log("CREATE REVIEW ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to post review",
    });
  }
};

exports.getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      book: req.params.bookId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort("-createdAt");

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to load reviews",
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("book", "title")
      .sort("-createdAt");

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to load reviews",
    });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    review.isApproved = req.body.isApproved;
    await review.save();

    await updateAverage(review.book);

    res.json({
      message: "Review status updated",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to update review",
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const bookId = review.book;

    await review.deleteOne();
    await updateAverage(bookId);

    res.json({
      message: "Review deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete review",
    });
  }
};