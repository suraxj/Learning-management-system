import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import {
  Home as HomeIcon,
  Users as UsersIcon,
  BookOpen as BookIcon,
  HelpCircle,
  TrendingUp
} from "lucide-react";

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reportRes, booksRes, usersRes] = await Promise.all([
        api.get("/reports/summary"),
        api.get("/books"),
        api.get("/auth/users"),
      ]);

      setReport(reportRes.data);
      setRecentBooks((booksRes.data.books || []).slice(0, 5));
      setRecentUsers((usersRes.data.users || []).slice(0, 5));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500 font-bold">
        Loading dashboard metrics...
      </div>
    );
  }

  // Fallbacks if backend doesn't load fully
  const totalBooksCount = report?.totalBooks || 0;
  const totalUsersCount = report?.totalUsers || 0;
  const totalProgramsCount = report?.inventory?.length || 0;
  const totalRevenueVal = report?.totalFineCollected || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      {/* Dynamic Stat Cards (Sanskaram style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Books Card */}
        <div className="bg-[#5c72e7] text-white rounded-xl p-6 shadow-md flex justify-between items-center transition-transform hover:scale-[1.02] duration-200">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-85">Total Books</p>
            <h3 className="text-4xl font-extrabold mt-3">{totalBooksCount}</h3>
          </div>
          <HomeIcon size={52} className="opacity-40" strokeWidth={1} />
        </div>

        {/* Total Users Card */}
        <div className="bg-[#ec5851] text-white rounded-xl p-6 shadow-md flex justify-between items-center transition-transform hover:scale-[1.02] duration-200">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-85">Total Users</p>
            <h3 className="text-4xl font-extrabold mt-3">{totalUsersCount}</h3>
          </div>
          <UsersIcon size={52} className="opacity-40" strokeWidth={1} />
        </div>

        {/* Total Genres/Programs Card */}
        <div className="bg-[#7985f3] text-white rounded-xl p-6 shadow-md flex justify-between items-center transition-transform hover:scale-[1.02] duration-200">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-85">Total Genres</p>
            <h3 className="text-4xl font-extrabold mt-3">{totalProgramsCount}</h3>
          </div>
          <BookIcon size={52} className="opacity-40" strokeWidth={1} />
        </div>

        {/* Total Revenue Card */}
        <div className="bg-[#f3b53f] text-white rounded-xl p-6 shadow-[#f3b53f]/10 shadow-md flex justify-between items-center transition-transform hover:scale-[1.02] duration-200">
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-wider opacity-85">Total Revenue</p>
            <div className="flex items-baseline mt-3">
              <span className="text-3xl font-black mr-1">₹</span>
              <h3 className="text-4xl font-extrabold">{totalRevenueVal}</h3>
            </div>
          </div>
          <TrendingUp size={52} className="opacity-40" strokeWidth={1} />
        </div>
      </div>

      {/* Grid of activity tables */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-6 items-start">
        {/* Recently Added Books Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-sm">Recently Added Books</h3>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Genre</th>
                  <th className="py-2.5 px-3">Copies</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBooks.map((book) => {
                  const available = Number(book.availableCopies || 0) > 0;
                  return (
                    <tr key={book._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 truncate max-w-[150px]">
                        {book.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{book.genre}</td>
                      <td className="py-3 px-3 text-slate-500 font-bold">
                        {book.availableCopies} / {book.copies}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={available ? "badge-active" : "badge-inactive"}>
                          {available ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Registered Users Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-sm">Recently Registered Users</h3>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joined At</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 leading-none">{u.name}</p>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block truncate max-w-[130px]">
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-semibold">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="badge-active">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}