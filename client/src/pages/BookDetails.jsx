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
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [daysRequested, setDaysRequested] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form Fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");

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
      const endpoint = `/reservations/${id}`;
      await api.post(endpoint);
      toast.success("Book reserved successfully");
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to reserve book`
      );
    }
  };

  const handlePayAndBorrow = async (e) => {
    e.preventDefault();

    if (paymentMethod === "UPI" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. user@okaxis)");
      return;
    }
    if (paymentMethod === "Card") {
      const plainCard = cardNumber.replace(/\s/g, "");
      if (plainCard.length !== 16 || isNaN(plainCard)) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardExpiry.includes("/") || cardExpiry.length !== 5) {
        toast.error("Please enter expiry date in MM/YY format");
        return;
      }
      if (cardCvv.length !== 3 || isNaN(cardCvv)) {
        toast.error("Please enter a valid 3-digit CVV");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter cardholder name");
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStage("Connecting to secure payment gateway...");
    await new Promise((r) => setTimeout(r, 1000));

    setProcessingStage("Verifying credentials and processing funds...");
    await new Promise((r) => setTimeout(r, 1000));

    setProcessingStage("Completing book allocation...");
    await new Promise((r) => setTimeout(r, 800));

    try {
      const methodStr = 
        paymentMethod === "UPI" 
          ? `UPI (${upiId})` 
          : paymentMethod === "Card" 
            ? "Card" 
            : `Net Banking (${bankName})`;

      await api.post(`/borrowings/${id}/borrow`, {
        daysRequested: Number(daysRequested),
        paymentMethod: methodStr
      });

      setPaymentSuccess(true);
      await new Promise((r) => setTimeout(r, 1500));

      // Reset Form and Close Modal
      setShowPaymentModal(false);
      setIsProcessing(false);
      setPaymentSuccess(false);
      setDaysRequested(7);
      setUpiId("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");

      fetchData();
    } catch (err) {
      setIsProcessing(false);
      toast.error(err.response?.data?.message || "Payment failed. Please try again.");
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
      setReviewForm({
        rating: 5,
        comment: "",
      });

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading book details...</div>;
  }

  if (!book) {
    return <div className="text-center p-10">Book not found.</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-slate-900 break-words">
          {book.title}
        </h1>

        <p className="text-slate-600 text-lg mb-4 break-words">
          by {book.author}
        </p>

        <p className="text-slate-700 leading-relaxed break-words">
          {book.description || "No description available."}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-lg text-sm">
          <p>
            <span className="font-semibold">ISBN:</span>{" "}
            {book.isbn || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Genre:</span>{" "}
            {book.genre || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Year:</span>{" "}
            {book.publicationYear || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Availability:</span>{" "}
            {book.availableCopies ?? 0}/{book.copies ?? 0}
          </p>

          <p>
            <span className="font-semibold">Rating:</span>{" "}
            {book.averageRating || 0}/5
          </p>
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
              Borrow
            </button>

            <button
              onClick={() => handleAction("reserve")}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600"
            >
              Reserve
            </button>
          </div>
        ) : (
          <p className="mt-6 text-slate-500">
            Please login to borrow, reserve, or review this book.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6 h-fit">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        <div className="space-y-4 mb-6">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div
                key={r._id}
                className="border-b border-slate-100 pb-3"
              >
                <p className="font-bold text-sm">
                  {r.user?.name || "Anonymous"}
                </p>

                <p className="text-yellow-600 text-xs font-semibold">
                  {r.rating}/5
                </p>

                <p className="text-sm text-slate-700 break-words">
                  {r.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm italic">
              No reviews yet.
            </p>
          )}
        </div>

        {user && (
          <form onSubmit={submitReview} className="space-y-3 pt-4 border-t">
            <select
              className="border p-3 rounded w-full bg-white"
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  rating: Number(e.target.value),
                })
              }
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>

            <textarea
              className="border p-3 rounded w-full min-h-[100px]"
              placeholder="Write a review..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
              required
            />

            <button className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-black transition-colors">
              Post Review
            </button>
          </form>
        )}
      </div>

      {/* Premium Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Borrow & Pay Securely</h3>
                <p className="text-blue-100 text-xs truncate max-w-[320px]">{book.title}</p>
              </div>
              <button 
                onClick={() => {
                  if (!isProcessing) setShowPaymentModal(false);
                }}
                disabled={isProcessing}
                className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Inner Content Area */}
            {isProcessing ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[350px]">
                {paymentSuccess ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Payment Successful!</h4>
                    <p className="text-slate-500 text-sm">Your book has been borrowed. Redirecting...</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <h4 className="text-lg font-semibold text-slate-800">Processing Your Borrowing</h4>
                    <p className="text-slate-500 text-sm max-w-xs">{processingStage}</p>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center justify-center gap-1 mt-4">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secure 256-bit SSL Connection
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handlePayAndBorrow} autoComplete="off" className="flex flex-col overflow-hidden max-h-full">
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh] scrollbar-thin">
                  
                  {/* Select Days & Pricing Info */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Rate</span>
                      <span className="text-slate-700 font-semibold text-sm">₹{book.borrowPricePerDay || 20} per day</span>
                    </div>
                    <div className="w-full sm:w-auto">
                      <label className="block text-xs text-slate-500 font-medium mb-1">Select Borrow Days</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="30"
                        value={daysRequested}
                        onChange={(e) => setDaysRequested(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                        className="w-20 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold"
                      />
                    </div>
                    <div className="text-right sm:border-l sm:pl-4">
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
                      <span className="text-blue-600 font-black text-xl">₹{daysRequested * (book.borrowPricePerDay || 20)}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("UPI")}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all ${
                          paymentMethod === "UPI" 
                            ? "border-blue-600 bg-blue-50/50 text-blue-600 font-semibold" 
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">UPI / Apps</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Card")}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all ${
                          paymentMethod === "Card" 
                            ? "border-blue-600 bg-blue-50/50 text-blue-600 font-semibold" 
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-xs">Credit/Debit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Net Banking")}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all ${
                          paymentMethod === "Net Banking" 
                            ? "border-blue-600 bg-blue-50/50 text-blue-600 font-semibold" 
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-xs">Net Banking</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Details Options forms */}
                  <div className="pt-2">
                    {paymentMethod === "UPI" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">UPI ID (VPA)</label>
                          <input 
                            type="text" 
                            placeholder="username@bank / mobile@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            required
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "Card" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Cardholder Name</label>
                          <input 
                            type="text" 
                            placeholder="JOHN DOE"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            required
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Card Number</label>
                          <input 
                            type="text" 
                            maxLength="19"
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                              const parts = [];
                              for (let i = 0; i < v.length; i += 4) {
                                parts.push(v.substring(i, i + 4));
                              }
                              setCardNumber(parts.join(" "));
                            }}
                            required
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Expiry Date</label>
                            <input 
                              type="text" 
                              maxLength="5"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "");
                                if (v.length >= 2) {
                                  setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`);
                                } else {
                                  setCardExpiry(v);
                                }
                              }}
                              required
                              autoComplete="off"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">CVV Code</label>
                            <input 
                              type="password" 
                              maxLength="3"
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                              required
                              autoComplete="off"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "Net Banking" && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Select Bank</label>
                        <select 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Payment is secure & encrypted
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
                  >
                    Pay & Borrow (₹{daysRequested * (book.borrowPricePerDay || 20)})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}