import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/summary')
      .then(({ data }) => setReport(data))
      .catch(() => toast.error('Failed to load dashboard metrics'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="text-center py-20 text-slate-500">Loading analytics...</div>;
  if (!report) return null;

  const stats = [
    { label: 'Total Books', value: report.totalBooks },
    { label: 'Total Users', value: report.totalUsers },
    { label: 'Currently Borrowed', value: report.borrowed },
    { label: 'Overdue Items', value: report.overdue },
  ];

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <h2 className="text-4xl font-extrabold text-blue-600 mt-2">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4">Inventory Status</h2>
          <div className="space-y-3">
            {report.inventory.map((i) => (
              <div key={i._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">{i._id}</span>
                <span className="text-sm font-bold text-blue-600">{i.availableCopies} / {i.totalCopies}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4">Top Borrowers</h2>
          <div className="space-y-3">
            {report.userActivity.map((u) => (
              <div key={u._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">{u.name}</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">
                  {u.totalBorrowed} borrowed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}