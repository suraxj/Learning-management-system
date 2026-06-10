import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  LayoutDashboard,
  ArrowLeftRight,
  CalendarDays,
  MessageSquare,
  BarChart3,
  CreditCard,
  Megaphone,
  Bell,
  Menu,
  X,
  User,
  Sparkles,
  LogOut
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/books", label: "Manage Books", icon: BookOpen },
    { to: "/admin/borrowings", label: "Borrowings", icon: ArrowLeftRight },
    { to: "/admin/reservations", label: "Reservations", icon: CalendarDays },
    { to: "/admin/reviews", label: "Review Management", icon: MessageSquare },
    { to: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex text-slate-800">
      {/* LEFT SIDEBAR */}
      <aside
        className={`bg-white border-r border-slate-200 w-64 fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
            <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-2 rounded-xl">
              <BookOpen size={20} />
              <Sparkles size={10} className="absolute -top-0.5 -right-0.5 text-yellow-300" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                LMS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-[#0077d6] text-white shadow-md shadow-[#0077d6]/25"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile details block at bottom */}
        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-9 w-9 rounded-full bg-[#0077d6] text-white flex items-center justify-center font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-900 truncate leading-none mb-0.5">{user.name}</p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* MAIN WRAPPER */}
      <div className="flex-1 md:pl-64 min-h-screen flex flex-col">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              Control Center
            </h2>
          </div>

          {/* Right Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold">
                  <User size={16} />
                </div>
                <span className="hidden sm:inline text-sm font-bold text-slate-700">
                  {user.name}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    onClick={() => setProfileDropdownOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Sparkles size={16} className="text-blue-500" />
                      <span>User Website</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-semibold">
          Copyright © 2026. All rights reserved by Sanskaram University, Haryana
        </footer>
      </div>
    </div>
  );
}
