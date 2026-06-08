import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BookOpen, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-2xl font-semibold transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    }`;

  const closeMenu = () => setOpen(false);
  const isAdmin = user && ["admin", "librarian"].includes(user.role);

  const links = isAdmin
    ? [
        { to: "/admin", label: "Dashboard" },
        { to: "/books", label: "Books" },
        { to: "/profile", label: "Users" },
        { to: "/notifications", label: "Alerts" },
        { to: "/admin/payments", label: "Payments" },
      ]
    : [
        { to: "/", label: "Dashboard" },
        { to: "/books", label: "Books" },
        ...(user
          ? [
              { to: "/profile", label: "Profile" },
              { to: "/notifications", label: "Notifications" },
              { to: "/payments", label: "Payments" },
            ]
          : []),
      ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-3">
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 shrink-0" onClick={closeMenu}>
          <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30">
            <BookOpen size={26} />
            <Sparkles size={13} className="absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">LMS</h1>
            <p className="text-xs sm:text-sm text-slate-500">Library Management System</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden bg-slate-100 p-3 rounded-2xl text-slate-800"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex items-center gap-2 lg:gap-3 text-sm lg:text-base">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass} end>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <span className="hidden xl:inline bg-white/80 border border-slate-200 px-4 py-2.5 rounded-2xl text-slate-700 whitespace-nowrap">
                {user.name} · <b className="text-blue-700">{user.role}</b>
              </span>
              <button
                onClick={logout}
                className="bg-slate-950 text-white px-5 py-2.5 rounded-2xl font-semibold whitespace-nowrap hover:-translate-y-0.5 transition-transform shadow-lg shadow-slate-900/15"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-semibold whitespace-nowrap hover:bg-blue-700 shadow-lg shadow-blue-600/25">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 px-3 py-4 space-y-2 shadow-sm">
          {links.map((link) => (
            <NavLink key={link.to} onClick={closeMenu} to={link.to} className={navClass} end>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <button
              onClick={() => { logout(); closeMenu(); }}
              className="w-full bg-slate-950 text-white px-4 py-3 rounded-2xl font-semibold text-left"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink onClick={closeMenu} to="/login" className={navClass}>Login</NavLink>
              <Link onClick={closeMenu} to="/register" className="block bg-blue-600 text-white px-4 py-3 rounded-2xl font-semibold">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
