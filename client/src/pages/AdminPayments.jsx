import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments"); // "payments" | "unpaid"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, borrowingsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/borrowings'),
      ]);
      setPayments(paymentsRes.data.payments || []);
      setBorrowings(borrowingsRes.data.borrowings || []);
    } catch (err) {
      toast.error('Failed to load transaction data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Financial Statistics
  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const collectedFines = payments
    .filter((p) => p.status === 'paid' && p.paymentType === 'fine')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const collectedBorrowFees = payments
    .filter((p) => p.status === 'paid' && p.paymentType === 'borrow')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const outstandingFines = borrowings
    .filter((b) => b.fine > 0 && !b.finePaid)
    .reduce((sum, b) => sum + (b.fine || 0), 0);

  // Filter lists based on search
  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.user?.name || "").toLowerCase().includes(term) ||
      (p.user?.email || "").toLowerCase().includes(term) ||
      (p.paymentType || "").toLowerCase().includes(term) ||
      (p.paymentMethod || "").toLowerCase().includes(term)
    );
  });

  const unpaidFinesList = borrowings.filter((b) => b.fine > 0 && !b.finePaid);

  const filteredUnpaidFines = unpaidFinesList.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.user?.name || "").toLowerCase().includes(term) ||
      (b.user?.email || "").toLowerCase().includes(term) ||
      (b.book?.title || "").toLowerCase().includes(term)
    );
  });

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading financials...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. Stat Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat Card 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revenue</span>
            <span className="text-2xl font-black text-slate-800">₹{totalCollected.toLocaleString()}</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Borrow Fees</span>
            <span className="text-2xl font-black text-slate-800">₹{collectedBorrowFees.toLocaleString()}</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider font-bold">Collected Fines</span>
            <span className="text-2xl font-black text-slate-800">₹{collectedFines.toLocaleString()}</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider font-bold">Outstanding Fines</span>
            <span className="text-2xl font-black text-slate-800">₹{outstandingFines.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. Controls Section */}
      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          
          {/* Tab Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("payments"); setSearchTerm(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "payments" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Payments ({payments.length})
            </button>
            <button
              onClick={() => { setActiveTab("unpaid"); setSearchTerm(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "unpaid" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Unpaid Fines ({unpaidFinesList.length})
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={activeTab === "payments" ? "Search payments..." : "Search unpaid fines..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tab 1: All Payments */}
        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{p.user?.name || 'Deleted User'}</span>
                      <span className="text-xs text-slate-400 block">{p.user?.email || ''}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.paymentType === 'borrow' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.paymentType === 'borrow' ? 'Borrow Fee' : 'Late Fine'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.paymentMethod || 'None'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
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
            
            {filteredPayments.length === 0 && (
              <p className="text-center py-10 text-slate-400 italic">No payments found matching "{searchTerm}"</p>
            )}
          </div>
        )}

        {/* Tab 2: Unpaid Fines */}
        {activeTab === "unpaid" && (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3 text-center">Overdue Days</th>
                  <th className="px-4 py-3">Pending Fine</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnpaidFines.map((b) => {
                  const overdueDays = Math.max(0, Math.ceil((Date.now() - new Date(b.dueDate)) / (24 * 60 * 60 * 1000)));
                  return (
                    <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 block">{b.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-slate-400 block">{b.user?.email || ''}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{b.book?.title || 'Unknown Book'}</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600">{overdueDays} days</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">₹{b.fine || 0}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
                          Unpaid Fine
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredUnpaidFines.length === 0 && (
              <p className="text-center py-10 text-slate-400 italic">No unpaid fines found matching "{searchTerm}"</p>
            )}
          </div>
        )}

      </div>

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}