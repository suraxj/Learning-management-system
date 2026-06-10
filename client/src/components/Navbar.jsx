import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BookOpen, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `block px-4 py-2 rounded-xl font-bold text-sm transition-all ${
      isActive
        ? "text-blue-600 bg-blue-50/60"
        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50/50"
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
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 shrink-0" onClick={closeMenu}>
          <div className="relative bg-[#0077d6] text-white p-2.5 rounded-2xl shadow-md shadow-blue-500/15">
            <BookOpen size={24} />
            <Sparkles size={11} className="absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">LMS</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Learning Management System</p>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden bg-slate-50 p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass} end>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700">
                {user.name} · <b className="text-[#0077d6] uppercase text-[10px]">{user.role}</b>
              </span>
              <button
                onClick={logout}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:shadow-lg hover:shadow-slate-900/10 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-4 py-2.5 font-bold text-sm transition-all ${
                    isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                  }`
                }
              >
                Login
              </NavLink>
              <Link
                to="/register"
                className="bg-[#0077d6] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Links */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg">
          {links.map((link) => (
            <NavLink key={link.to} onClick={closeMenu} to={link.to} className={navClass} end>
              {link.label}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="w-full text-center bg-slate-950 text-white px-4 py-3 rounded-2xl font-bold text-sm"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  onClick={closeMenu}
                  to="/login"
                  className="w-full text-center border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  onClick={closeMenu}
                  to="/register"
                  className="w-full text-center bg-[#0077d6] text-white px-4 py-3 rounded-2xl font-bold text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
