import { Link } from 'react-router-dom';

const ADMIN_LINKS = [
  { to: '/admin/books', label: 'Manage Books' },
  { to: '/admin/borrowings', label: 'Borrowings' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/reviews', label: 'Review Management' },
  { to: '/admin/reports', label: 'Reports & Analytics' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/announcements', label: 'Announcements' },
];

export default function AdminDashboard() {
  return (
    <div className="p-0 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {ADMIN_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white shadow-sm border border-slate-100 rounded-xl p-5 sm:p-8 font-semibold text-base sm:text-lg hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex items-center justify-center text-center"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}