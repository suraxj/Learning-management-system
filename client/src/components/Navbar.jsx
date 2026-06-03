import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl font-semibold transition ${
      isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  const closeMenu = () => setOpen(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 shrink-0" onClick={closeMenu}>
          <div className="bg-blue-600 text-white p-2.5 sm:p-3 rounded-2xl">
            <BookOpen size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">LMS</h1>
            <p className="text-xs sm:text-sm text-slate-500">Library Management System</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden bg-slate-100 p-3 rounded-xl text-slate-800"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex items-center gap-2 lg:gap-3 text-base">
          <NavLink to="/" className={navClass}>Dashboard</NavLink>
          <NavLink to="/books" className={navClass}>Books</NavLink>

          {user && ["admin", "librarian"].includes(user.role) && (
            <NavLink to="/admin" className={navClass}>Admin</NavLink>
          )}

          {user && <NavLink to="/profile" className={navClass}>Profile</NavLink>}
          {user && <NavLink to="/notifications" className={navClass}>Notifications</NavLink>}
          {user && <NavLink to="/payments" className={navClass}>Payments</NavLink>}

          {user ? (
            <>
              <span className="hidden xl:inline bg-slate-100 px-4 py-3 rounded-xl text-slate-800 whitespace-nowrap">
                {user.name} · {user.role}
              </span>
              <button
                onClick={logout}
                className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-3 py-4 space-y-2 shadow-sm">
          <NavLink onClick={closeMenu} to="/" className={navClass}>Dashboard</NavLink>
          <NavLink onClick={closeMenu} to="/books" className={navClass}>Books</NavLink>

          {user && ["admin", "librarian"].includes(user.role) && (
            <NavLink onClick={closeMenu} to="/admin" className={navClass}>Admin</NavLink>
          )}

          {user && <NavLink onClick={closeMenu} to="/profile" className={navClass}>Profile</NavLink>}
          {user && <NavLink onClick={closeMenu} to="/notifications" className={navClass}>Notifications</NavLink>}
          {user && <NavLink onClick={closeMenu} to="/payments" className={navClass}>Payments</NavLink>}

          {user ? (
            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold text-left"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink onClick={closeMenu} to="/login" className={navClass}>Login</NavLink>
              <Link
                onClick={closeMenu}
                to="/register"
                className="block bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
