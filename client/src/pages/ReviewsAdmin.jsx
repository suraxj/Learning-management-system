import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const { data } = await api.get('/reviews');
      setReviews(data.reviews);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id, isApproved) => {
    try {
      await api.put(`/reviews/${id}/status`, { isApproved });
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
      loadReviews();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review removed');
      loadReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading reviews...</div>;

  return (
    <div className="bg-white shadow-sm border border-slate-100 rounded-xl p-6">
      <h1 className="text-2xl font-bold mb-6">Review Management</h1>

      {reviews.length === 0 ? (
        <p className="text-slate-500 text-center py-10">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border border-slate-100 p-4 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{r.book?.title || 'Unknown Book'}</h3>
                  <p className="text-sm text-slate-500">By {r.user?.name || 'Anonymous'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  r.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {r.isApproved ? 'Approved' : 'Hidden'}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-yellow-600 text-sm font-bold">{r.rating}/5 Stars</p>
                <p className="text-slate-700 mt-1">{r.comment}</p>
              </div>

              <div className="mt-4 flex gap-4 text-sm font-medium">
                {!r.isApproved && (
                  <button onClick={() => handleUpdateStatus(r._id, true)} className="text-green-600 hover:text-green-800">
                    Approve
                  </button>
                )}
                {r.isApproved && (
                  <button onClick={() => handleUpdateStatus(r._id, false)} className="text-amber-600 hover:text-amber-800">
                    Hide
                  </button>
                )}
                <button onClick={() => handleRemove(r._id)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}