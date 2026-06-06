import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser && ["admin", "librarian"].includes(currentUser.role);

  // User states
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState({ name: "", phone: "", address: "" });
  const [payingId, setPayingId] = useState(null);

  // Admin states
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/auth/me");
      setData(res.data);
      setEdit({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        address: res.data.user.address || "",
      });
    } catch (err) {
      toast.error("Failed to load profile details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/auth/users");
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load registered users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminUsers();
    } else {
      loadUser();
    }
  }, [isAdmin]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", edit);
      toast.success("Profile updated successfully");
      loadUser();
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const returnBook = async (id) => {
    try {
      const { data: resData } = await api.put(`/borrowings/${id}/return`);
      toast.success(`Returned. Fine: ₹${resData.fine}`);
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to return book");
    }
  };

  const payFine = async (id) => {
    try {
      setPayingId(id);
      const { data: resData } = await api.post(`/payments/fine/${id}`);

      if (resData.url) {
        window.location.href = resData.url;
        return;
      }

      toast.success(resData.message || "Payment successful");
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading profile data...</div>;

  // Render Admin View: Registered Users list
  if (isAdmin) {
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const librarianCount = users.filter((u) => u.role === "librarian").length;
    const memberCount = users.filter((u) => u.role === "user").length;

    const filteredUsers = users.filter((u) => {
      const term = searchTerm.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.role || "").toLowerCase().includes(term) ||
        (u.phone || "").toLowerCase().includes(term)
      );
    });

    return (
      <div className="space-y-6">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total Registered</span>
              <span className="text-2xl font-black text-slate-800">{totalUsers}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Admins</span>
              <span className="text-2xl font-black text-slate-800">{adminCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Librarians</span>
              <span className="text-2xl font-black text-slate-800">{librarianCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Members</span>
              <span className="text-2xl font-black text-slate-800">{memberCount}</span>
            </div>
          </div>
        </div>

        {/* Search and User List */}
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">Registered Users List</h2>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === "admin" 
                          ? "bg-rose-100 text-rose-700" 
                          : u.role === "librarian"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{u.address || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <p className="text-center py-8 text-slate-400 italic">No registered users found matching "{searchTerm}"</p>
            )}
          </div>
        </div>

      </div>
    );
  }

  // Render User View: Personal Profile
  if (!data) return <p className="text-center p-6 text-slate-500">Loading user profile...</p>;

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
        <p className="text-slate-700">{data.user.name} — {data.user.email}</p>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Role: {data.user.role}</p>

        <form onSubmit={updateProfile} className="grid md:grid-cols-3 gap-3 mt-4">
          <input
            className="border p-3 rounded text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
            value={edit.name}
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
            required
          />
          <input
            className="border p-3 rounded text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Phone"
            value={edit.phone}
            onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
          />
          <input
            className="border p-3 rounded text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Address"
            value={edit.address}
            onChange={(e) => setEdit({ ...edit, address: e.target.value })}
          />
          <button className="bg-blue-600 text-white p-3 rounded md:col-span-3 hover:bg-blue-700 transition font-bold text-sm shadow">
            Update Profile
          </button>
        </form>
      </section>

      <section className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-3">Borrowing History</h2>

        {data.borrowings.length === 0 ? (
          <p className="text-slate-500 text-sm">No borrowing history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Fine</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.borrowings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{b.book?.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.status === "returned" 
                          ? "bg-green-100 text-green-700" 
                          : b.status === "overdue"
                            ? "bg-red-100 text-red-700 animate-pulse"
                            : "bg-blue-100 text-blue-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">₹{b.fine}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {b.finePaid ? "Paid" : Number(b.fine) > 0 ? "Pending" : "No fine"}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {b.status !== "returned" && (
                        <button
                          onClick={() => returnBook(b._id)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 font-bold transition shadow"
                        >
                          Return
                        </button>
                      )}

                      {Number(b.fine) > 0 && !b.finePaid && (
                        <button
                          onClick={() => payFine(b._id)}
                          disabled={payingId === b._id}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 font-bold disabled:bg-slate-400 transition shadow"
                        >
                          {payingId === b._id ? "Paying..." : "Pay Fine"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-3">Reserved Books</h2>
        {data.reservations.length === 0 ? (
          <p className="text-slate-500 text-sm">No reserved books.</p>
        ) : (
          <div className="space-y-2">
            {data.reservations.map((r) => (
              <div key={r._id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm border">
                <span className="font-semibold text-slate-700">{r.book?.title}</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-700">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-3">Notifications</h2>
        {data.notifications.length === 0 ? (
          <p className="text-slate-500 text-sm">No notifications.</p>
        ) : (
          <div className="space-y-2">
            {data.notifications.map((n) => (
              <div key={n._id} className="p-3 bg-slate-50 rounded-lg text-sm border flex flex-col gap-1">
                <span className="font-bold text-slate-800">{n.title}</span>
                <span className="text-slate-600">{n.message}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
