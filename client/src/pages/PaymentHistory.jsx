import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

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
      <section className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Pending Fine Payments</h1>

        {pendingFines.length === 0 ? (
          <p className="text-slate-500">No pending fines.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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

      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>

        {payments.length === 0 ? (
          <p className="text-slate-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Book</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b">
                    <td className="py-3">
                      {p.borrow?.book?.title || "Fine Payment"}
                    </td>
                    <td>₹{p.amount}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          p.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
