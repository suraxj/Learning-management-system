import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function BookDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [daysRequested, setDaysRequested] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bookRes, reviewsRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get(`/reviews/book/${id}`),
      ]);
      setBook(bookRes.data.book);
      setReviews(reviewsRes.data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load book details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (actionType === "borrow") {
      setShowPaymentModal(true);
      return;
    }

    try {
      await api.post(`/reservations/${id}`);
      toast.success("Book reserved successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reserve book");
    }
  };

  const handleStripeBorrowPayment = async (e) => {
    e.preventDefault();

    try {
      setIsProcessing(true);
      const res = await api.post(`/payments/borrow/${id}`, {
        daysRequested: Number(daysRequested),
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }

      toast.error("Stripe checkout URL not received");
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      toast.error(err.response?.data?.message || "Failed to start Stripe payment");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      await api.post(`/reviews/book/${id}`, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      toast.success("Review submitted successfully");
      setReviewForm({ rating: 5, comment: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading book details...</div>;
  if (!book) return <div className="text-center p-10">Book not found.</div>;

  const pricePerDay = Number(book.borrowPricePerDay || 20);
  const totalAmount = Number(daysRequested) * pricePerDay;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-slate-900 break-words">{book.title}</h1>
        <p className="text-slate-600 text-lg mb-4 break-words">by {book.author}</p>
        <p className="text-slate-700 leading-relaxed break-words">
          {book.description || "No description available."}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-lg text-sm">
          <p><span className="font-semibold">ISBN:</span> {book.isbn || "N/A"}</p>
          <p><span className="font-semibold">Genre:</span> {book.genre || "N/A"}</p>
          <p><span className="font-semibold">Year:</span> {book.publicationYear || "N/A"}</p>
          <p><span className="font-semibold">Availability:</span> {book.availableCopies ?? 0}/{book.copies ?? 0}</p>
          <p><span className="font-semibold">Rating:</span> {book.averageRating || 0}/5</p>
          <p><span className="font-semibold">Borrow Price:</span> ₹{pricePerDay}/day</p>
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => handleAction("borrow")}
              disabled={book.availableCopies < 1}
              className={`px-6 py-3 rounded-lg text-white ${
                book.availableCopies < 1
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Borrow with Stripe
            </button>

            <button
              onClick={() => handleAction("reserve")}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600"
            >
              Reserve
            </button>
          </div>
        ) : (
          <p className="mt-6 text-slate-500">Please login to borrow, reserve, or review this book.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6 h-fit">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        <div className="space-y-4 mb-6">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="border-b border-slate-100 pb-3">
                <p className="font-bold text-sm">{r.user?.name || "Anonymous"}</p>
                <p className="text-yellow-600 text-xs font-semibold">{r.rating}/5</p>
                <p className="text-sm text-slate-700 break-words">{r.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm italic">No reviews yet.</p>
          )}
        </div>

        {user && (
          <form onSubmit={submitReview} className="space-y-3 pt-4 border-t">
            <select
              className="border p-3 rounded w-full bg-white"
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
            </select>

            <textarea
              className="border p-3 rounded w-full min-h-[100px]"
              placeholder="Write a review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
            />

            <button className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-black transition-colors">
              Post Review
            </button>
          </form>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Stripe Checkout Payment</h3>
                <p className="text-blue-100 text-xs truncate max-w-[300px]">{book.title}</p>
              </div>
              <button
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                disabled={isProcessing}
                className="text-white text-2xl leading-none disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStripeBorrowPayment} className="p-6 space-y-5">
              <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Price per day</span>
                  <span className="font-semibold">₹{pricePerDay}</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Borrow Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={daysRequested}
                    onChange={(e) => setDaysRequested(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div className="flex justify-between text-lg border-t pt-3">
                  <span className="font-bold">Total</span>
                  <span className="font-black text-blue-600">₹{totalAmount}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                You will be redirected to the real Stripe Checkout page. Card details are handled by Stripe, not stored in this app.
              </p>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-xl font-bold"
              >
                {isProcessing ? "Redirecting to Stripe..." : `Pay ₹${totalAmount} with Stripe`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
