import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Profile() {
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState({ name: "", phone: "", address: "" });
  const [payingId, setPayingId] = useState(null);

  const load = async () => {
    const res = await api.get("/auth/me");
    setData(res.data);
    setEdit({
      name: res.data.user.name || "",
      phone: res.data.user.phone || "",
      address: res.data.user.address || "",
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    await api.put("/auth/profile", edit);
    toast.success("Profile updated");
    load();
  };

  const returnBook = async (id) => {
    try {
      const { data } = await api.put(`/borrowings/${id}/return`);
      toast.success(`Returned. Fine: ₹${data.fine}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const payFine = async (id) => {
    try {
      setPayingId(id);
      const { data } = await api.post(`/payments/fine/${id}`);

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      toast.success(data.message || "Payment successful");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p>{data.user.name} — {data.user.email}</p>
        <p>Role: {data.user.role}</p>

        <form onSubmit={updateProfile} className="grid md:grid-cols-3 gap-3 mt-4">
          <input
            className="border p-3 rounded"
            placeholder="Name"
            value={edit.name}
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
          />
          <input
            className="border p-3 rounded"
            placeholder="Phone"
            value={edit.phone}
            onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
          />
          <input
            className="border p-3 rounded"
            placeholder="Address"
            value={edit.address}
            onChange={(e) => setEdit({ ...edit, address: e.target.value })}
          />
          <button className="bg-blue-600 text-white p-3 rounded md:col-span-3">
            Update Profile
          </button>
        </form>
      </section>

      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-bold mb-3">Borrowing History</h2>

        {data.borrowings.length === 0 ? (
          <p className="text-slate-500">No borrowing history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Book</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Fine</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.borrowings.map((b) => (
                  <tr key={b._id} className="border-b">
                    <td className="py-3">{b.book?.title}</td>
                    <td>{b.status}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td>₹{b.fine}</td>
                    <td>{b.finePaid ? "Paid" : Number(b.fine) > 0 ? "Pending" : "No fine"}</td>
                    <td className="space-x-2">
                      {b.status !== "returned" && (
                        <button
                          onClick={() => returnBook(b._id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Return
                        </button>
                      )}

                      {Number(b.fine) > 0 && !b.finePaid && (
                        <button
                          onClick={() => payFine(b._id)}
                          disabled={payingId === b._id}
                          className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-slate-400"
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

      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-bold mb-3">Reserved Books</h2>
        {data.reservations.length === 0 ? (
          <p className="text-slate-500">No reserved books.</p>
        ) : (
          data.reservations.map((r) => (
            <p key={r._id}>{r.book?.title} — {r.status}</p>
          ))
        )}
      </section>

      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-bold mb-3">Notifications</h2>
        {data.notifications.length === 0 ? (
          <p className="text-slate-500">No notifications.</p>
        ) : (
          data.notifications.map((n) => (
            <p key={n._id}>{n.title}: {n.message}</p>
          ))
        )}
      </section>
    </div>
  );
}
