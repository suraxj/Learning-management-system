import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reservations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reservations')
      .then(({ data }) => setItems(data.reservations || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading reservations...</p>;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Reservations</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">No reservations found.</p>
      ) : (
        items.map((r) => (
          <div key={r._id} className="border-t py-3">
            <p>
              <span className="font-semibold">{r.user?.name || 'Unknown User'}</span>{' '}
              reserved{' '}
              <span className="font-semibold">{r.book?.title || 'Unknown Book'}</span>
            </p>
            <p className="text-sm text-slate-500">Status: {r.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
