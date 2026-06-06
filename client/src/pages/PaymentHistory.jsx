import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ReceiptModal from "../components/ReceiptModal";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [paymentRes, borrowRes] = await Promise.all([
        api.get("/payments/mine"),
        api.get("/borrowings/mine"),
      ]);

      setPayments(paymentRes.data.payments || []);
      setBorrowings(borrowRes.data.borrowings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const payFine = async (borrowId) => {
    try {
      setPayingId(borrowId);
      const { data } = await api.post(`/payments/fine/${borrowId}`);

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      toast.success(data.message || "Payment successful");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const pendingFines = borrowings.filter(
    (b) => Number(b.fine) > 0 && !b.finePaid
  );

  if (loading) return <p>Loading payment data...</p>;

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Pending Fine Payments</h1>

        {pendingFines.length === 0 ? (
          <p className="text-slate-500">No pending fines.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[650px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Book</th>
                  <th>Return/Due Status</th>
                  <th>Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingFines.map((b) => (
                  <tr key={b._id} className="border-b">
                    <td className="py-3">{b.book?.title || "Unknown Book"}</td>
                    <td>{b.status}</td>
                    <td>₹{b.fine}</td>
                    <td>
                      <button
                        onClick={() => payFine(b._id)}
                        disabled={payingId === b._id}
                        className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-slate-400"
                      >
                        {payingId === b._id ? "Processing..." : "Pay Fine"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Payment History</h2>

        {payments.length === 0 ? (
          <p className="text-slate-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[650px] w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Payment Item</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.borrow?.book?.title || "Library Fine / Fees"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.paymentType === 'borrow' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.paymentType === 'borrow' ? 'Borrow Fee' : 'Late Fine'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">₹{p.amount}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.paymentMethod || 'None'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {p.status === "paid" && (
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
