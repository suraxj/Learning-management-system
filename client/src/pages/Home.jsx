import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Clock,
  IndianRupee,
  BarChart3,
  Bell,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow border border-slate-100">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
          <Icon size={30} />
        </div>
        <div>
          <p className="text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
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
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
    } catch {
      setBooksCount(0);
    }

    if (!user) {
      setBorrowings([]);
      setNotifications([]);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setBorrowings(data.borrowings || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const activeBorrowings = borrowings.filter(
    (b) => getBorrowStatus(b) === "borrowed" || getBorrowStatus(b) === "overdue"
  );

  const overdue = borrowings.filter(
    (b) => getBorrowStatus(b) === "overdue"
  ).length;

  const pendingFines = borrowings.reduce((sum, b) => {
    if (b.finePaid) return sum;
    return sum + Number(b.fine || 0);
  }, 0);

  const displayBorrowings = borrowings.slice(0, 5);
  const displayNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-10">
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 sm:p-10 text-white shadow">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-5">
          Manage your library in one place
        </h1>

        <p className="text-lg sm:text-2xl text-blue-100 mb-6 sm:mb-8">
          Login, add books, borrow, reserve, return, search, and manage fines.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <Link
            to="/books"
            className="bg-white text-blue-700 px-6 sm:px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl text-center"
          >
            Browse Books
          </Link>

          {user && ["admin", "librarian"].includes(user.role) ? (
            <Link
              to="/admin"
              className="bg-blue-500/40 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl border border-white/30 text-center"
            >
              Admin Panel
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500/40 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl border border-white/30 text-center"
            >
              Login
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          title="Total Books"
          value={booksCount}
          subtitle="Live count from database"
        />

        <StatCard
          icon={Users}
          title="Current User"
          value={user ? user.role : "Guest"}
          subtitle={user ? user.name : "Login to borrow/reserve"}
        />

        <StatCard
          icon={Clock}
          title="Borrowed"
          value={activeBorrowings.length}
          subtitle={`${overdue} overdue`}
        />

        <StatCard
          icon={IndianRupee}
          title="Pending Fines"
          value={`₹${pendingFines}`}
          subtitle="Stripe or demo payment supported"
        />
      </section>

      <section className="rounded-3xl bg-white p-4 sm:p-8 shadow border border-slate-100">
        <div className="flex justify-between items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Recent Borrowings</h2>
          <BarChart3 className="text-slate-400" size={32} />
        </div>

        {displayBorrowings.length === 0 ? (
          <p className="text-slate-500">No recent borrowings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-[700px] w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Book</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>

              <tbody>
                {displayBorrowings.map((b) => {
                  const status = getBorrowStatus(b);

                  return (
                    <tr key={b._id} className="border-t">
                      <td className="p-4 font-semibold">
                        {b.book?.title || "Unknown Book"}
                      </td>

                      <td>{formatDate(b.borrowDate || b.createdAt)}</td>

                      <td>{formatDate(b.dueDate)}</td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            status === "overdue"
                              ? "bg-red-50 text-red-600"
                              : status === "returned"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>₹{b.fine || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-4 sm:p-8 shadow border border-slate-100">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>

        {displayNotifications.length === 0 ? (
          <p className="text-slate-500">No notifications yet.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {displayNotifications.map((n) => (
              <div
                key={n._id}
                className="flex items-start sm:items-center gap-3 sm:gap-4 rounded-2xl bg-blue-50 p-4 sm:p-5 text-blue-700"
              >
                <Bell size={22} />
                <p className="text-base sm:text-lg">
                  {n.title}: {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}