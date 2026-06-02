import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifications/mine')
      .then(({ data }) => setItems(data.notifications || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">No notifications found.</p>
      ) : (
        items.map((n) => (
          <div key={n._id} className="border-t py-3">
            <h2 className="font-semibold">{n.title}</h2>
            <p className="text-slate-600">{n.message}</p>
            <p className="text-xs text-slate-400 mt-1">{n.type}</p>
          </div>
        ))
      )}
    </div>
  );
}
