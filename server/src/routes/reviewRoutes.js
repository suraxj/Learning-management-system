const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const protect = require("../middleware/auth");
const role = require("../middleware/role");

router.get("/", protect, role("admin", "librarian"), reviewController.getAllReviews);

router.get("/book/:bookId", reviewController.getBookReviews);

router.post("/book/:bookId", protect, reviewController.createReview);

router.put(
  "/:id/status",
  protect,
  role("admin", "librarian"),
  reviewController.updateReviewStatus
);

router.delete(
  "/:id",
  protect,
  role("admin", "librarian"),
  reviewController.deleteReview
);

module.exports = router;