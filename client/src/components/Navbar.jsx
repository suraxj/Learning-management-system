import { Link, NavLink } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }) =>
    `px-5 py-3 rounded-xl font-semibold transition ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-4 shrink-0">
          <div className="bg-blue-600 text-white p-3 rounded-2xl">
            <BookOpen size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">LibraryMS</h1>
            <p className="text-sm text-slate-500">MERN Library System</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-base flex-wrap justify-end">
          <NavLink to="/" className={navClass}>Dashboard</NavLink>
          <NavLink to="/books" className={navClass}>Books</NavLink>

          {user && ['admin', 'librarian'].includes(user.role) && (
            <NavLink to="/admin" className={navClass}>Admin</NavLink>
          )}

          {user && <NavLink to="/profile" className={navClass}>Profile</NavLink>}
          {user && <NavLink to="/notifications" className={navClass}>Notifications</NavLink>}
          {user && <NavLink to="/payments" className={navClass}>Payments</NavLink>}

          {user ? (
            <>
              <span className="hidden lg:inline bg-slate-100 px-5 py-3 rounded-xl text-slate-800">
                {user.name} · {user.role}
              </span>
              <button onClick={logout} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
