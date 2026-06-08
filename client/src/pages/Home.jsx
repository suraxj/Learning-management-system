import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, IndianRupee, BarChart3, Bell, ArrowRight, ShieldCheck, Search, CreditCard } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="glass-card rounded-3xl p-6 hover:-translate-y-1 transition-all">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-4 text-white shadow-lg shadow-blue-500/25">
          <Icon size={28} />
        </div>
        <div>
          <p className="text-slate-500 font-medium">{title}</p>
          <h3 className="text-3xl font-black text-slate-950">{value}</h3>
        </div>
      </div>
      <p className="mt-5 text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [booksCount, setBooksCount] = useState(0);
  const [borrowings, setBorrowings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getBorrowStatus = (b) => {
    if (b.status === "returned") return "returned";
    if (b.dueDate && new Date(b.dueDate) < new Date()) return "overdue";
    return "borrowed";
  };

  const loadDashboardData = async () => {
    try {
      const { data } = await api.get("/books");
      setBooksCount(data.books?.length || 0);
    } catch { setBooksCount(0); }

    if (!user) {
      setBorrowings([]);
      setNotifications([]);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setBorrowings(data.borrowings || []);
      setNotifications(data.notifications || []);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { loadDashboardData(); }, [user]);

  const activeBorrowings = borrowings.filter((b) => ["borrowed", "overdue"].includes(getBorrowStatus(b)));
  const overdue = borrowings.filter((b) => getBorrowStatus(b) === "overdue").length;
  const pendingFines = borrowings.reduce((sum, b) => b.finePaid ? sum : sum + Number(b.fine || 0), 0);
  const displayBorrowings = borrowings.slice(0, 5);
  const displayNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-7 sm:space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 sm:p-10 lg:p-12 text-white shadow-2xl shadow-blue-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.55),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,.35),transparent_30%)]" />
        <div className="absolute -right-16 -bottom-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1.2fr_.8fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold text-blue-100 mb-5">
              <ShieldCheck size={17} /> Real-time Library Management
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-5">
              Manage your library with a clean modern dashboard
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl">
              Search books, borrow, reserve, track fines, send notifications and manage payments from one beautiful LMS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/books" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-7 py-4 rounded-2xl font-black text-lg shadow-xl hover:-translate-y-0.5 transition-transform">
                Browse Books <ArrowRight size={20} />
              </Link>
              {user && ["admin", "librarian"].includes(user.role) ? (
                <Link to="/admin" className="inline-flex items-center justify-center bg-white/10 text-white px-7 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/15">
                  Admin Panel
                </Link>
              ) : (
                <Link to="/login" className="inline-flex items-center justify-center bg-white/10 text-white px-7 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/15">
                  Login Now
                </Link>
              )}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-5 sm:p-6 text-slate-900 bg-white/90">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-blue-50 p-5"><Search className="text-blue-600 mb-5" /><b>Smart Search</b><p className="text-sm text-slate-500 mt-1">Find books fast</p></div>
              <div className="rounded-3xl bg-cyan-50 p-5"><CreditCard className="text-cyan-600 mb-5" /><b>Payments</b><p className="text-sm text-slate-500 mt-1">Stripe ready</p></div>
              <div className="rounded-3xl bg-emerald-50 p-5"><Clock className="text-emerald-600 mb-5" /><b>Due Dates</b><p className="text-sm text-slate-500 mt-1">Track returns</p></div>
              <div className="rounded-3xl bg-amber-50 p-5"><Bell className="text-amber-600 mb-5" /><b>Alerts</b><p className="text-sm text-slate-500 mt-1">Notify users</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} title="Total Books" value={booksCount} subtitle="Live count from database" />
        <StatCard icon={Users} title="Current User" value={user ? user.role : "Guest"} subtitle={user ? user.name : "Login to borrow/reserve"} />
        <StatCard icon={Clock} title="Borrowed" value={activeBorrowings.length} subtitle={`${overdue} overdue`} />
        <StatCard icon={IndianRupee} title="Pending Fines" value={`₹${pendingFines}`} subtitle="Real payment integration ready" />
      </section>

      <section className="glass-card rounded-3xl p-4 sm:p-8">
        <div className="flex justify-between items-center gap-4 mb-6">
          <div>
            <p className="text-blue-600 font-bold">Activity</p>
            <h2 className="text-2xl sm:text-3xl font-black">Recent Borrowings</h2>
          </div>
          <BarChart3 className="text-blue-500" size={34} />
        </div>

        {displayBorrowings.length === 0 ? (
          <p className="text-slate-500">No recent borrowings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="min-w-[700px] w-full text-left">
              <thead className="bg-blue-50 text-slate-600">
                <tr><th className="p-4">Book</th><th>Borrow Date</th><th>Due Date</th><th>Status</th><th>Fine</th></tr>
              </thead>
              <tbody>
                {displayBorrowings.map((b) => {
                  const status = getBorrowStatus(b);
                  return (
                    <tr key={b._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-bold">{b.book?.title || "Unknown Book"}</td>
                      <td>{formatDate(b.borrowDate || b.createdAt)}</td>
                      <td>{formatDate(b.dueDate)}</td>
                      <td><span className={`px-3 py-1 rounded-full text-sm font-bold ${status === "overdue" ? "bg-red-50 text-red-600" : status === "returned" ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-600"}`}>{status}</span></td>
                      <td>₹{b.fine || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-card rounded-3xl p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-black mb-6">Notifications</h2>
        {displayNotifications.length === 0 ? (
          <p className="text-slate-500">No notifications yet.</p>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {displayNotifications.map((n) => (
              <div key={n._id} className="flex items-start gap-4 rounded-3xl bg-blue-50 p-5 text-blue-800 border border-blue-100">
                <Bell size={22} className="shrink-0" />
                <p className="text-base sm:text-lg"><b>{n.title}:</b> {n.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
