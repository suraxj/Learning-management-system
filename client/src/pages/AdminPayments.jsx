import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/payments')
      .then(({ data }) => setPayments(data.payments))
      .catch(() => toast.error('Failed to load payment records'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-6 text-center">Loading payments...</div>;

  return (
    <div className="bg-white shadow rounded-xl p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">All Payments</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {p.user?.name || 'Deleted User'}
                </td>
                <td className="px-4 py-3">₹{p.amount?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {payments.length === 0 && (
          <p className="text-center py-6 text-slate-500">No payment records found.</p>
        )}
      </div>
    </div>
  );
}