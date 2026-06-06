import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Borrowings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/borrowings')
      .then(({ data }) => setItems(data.borrowings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading borrowings...</p>;

  return (
    <div className="bg-white shadow rounded-xl p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">All Borrowings</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">No borrowings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3 text-center">Days</th>
                <th className="px-4 py-3">Paid Fee</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 block">{b.user?.name || 'Unknown User'}</span>
                    <span className="text-xs text-slate-400 block">{b.user?.email || ''}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{b.book?.title || 'Unknown Book'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-600">{b.borrowDaysRequested || 14} days</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">₹{b.borrowFee || 0}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{b.paymentMethod || 'None'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      b.status === 'returned' 
                        ? 'bg-green-100 text-green-700' 
                        : b.status === 'overdue'
                          ? 'bg-red-100 text-red-700 animate-pulse'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    ₹{b.fine || 0}
                    {b.fine > 0 && (
                      <span className={`ml-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        b.finePaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {b.finePaid ? 'Paid' : 'Unpaid'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
