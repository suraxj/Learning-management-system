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
      <h1 className="text-xl sm:text-2xl font-bold mb-4">All Borrowings</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">No borrowings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">User</th>
                <th>Book</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b._id} className="border-t">
                  <td className="py-2">{b.user?.name || 'Unknown User'}</td>
                  <td>{b.book?.title || 'Unknown Book'}</td>
                  <td>{b.status}</td>
                  <td>{b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '-'}</td>
                  <td>₹{b.fine || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
