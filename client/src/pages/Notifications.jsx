import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser && ["admin", "librarian"].includes(currentUser.role);

  // Common loading state
  const [isLoading, setIsLoading] = useState(true);

  // User notifications state
  const [notifications, setNotifications] = useState([]);

  // Admin notification manager states
  const [users, setUsers] = useState([]);
  const [sentLog, setSentLog] = useState([]);
  const [alertType, setAlertType] = useState("direct"); // "direct" | "global"
  
  // Direct notification form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [directTitle, setDirectTitle] = useState("");
  const [directMessage, setDirectMessage] = useState("");

  // Global announcement form
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");

  const loadUserNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/notifications/mine");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, sentRes] = await Promise.all([
        api.get("/auth/users"),
        api.get("/notifications/sent"),
      ]);
      setUsers(usersRes.data.users || []);
      setSentLog(sentRes.data.notifications || []);
      if (usersRes.data.users?.length > 0) {
        setSelectedUserId(usersRes.data.users[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load administration tools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      loadUserNotifications();
    }
  }, [isAdmin]);

  const handleSendDirect = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !directTitle.trim() || !directMessage.trim()) {
      toast.error("Please fill in all direct message fields");
      return;
    }

    try {
      await api.post("/notifications/send", {
        userId: selectedUserId,
        title: directTitle.trim(),
        message: directMessage.trim(),
      });
      toast.success("Direct notification sent successfully");
      setDirectTitle("");
      setDirectMessage("");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to send direct alert");
    }
  };

  const handleSendGlobal = async (e) => {
    e.preventDefault();
    if (!globalTitle.trim() || !globalMessage.trim()) {
      toast.error("Please fill in all announcement fields");
      return;
    }

    try {
      await api.post("/notifications/announce", {
        title: globalTitle.trim(),
        message: globalMessage.trim(),
      });
      toast.success("Global announcement sent successfully");
      setGlobalTitle("");
      setGlobalMessage("");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to broadcast announcement");
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Notification deleted successfully");
      loadAdminData();
    } catch (err) {
      toast.error("Failed to delete notification record");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading notification center...</div>;

  // Render Admin Layout: Notification Manager
  if (isAdmin) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: Send Notification Forms */}
        <div className="lg:col-span-1 bg-white shadow-sm border border-slate-100 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">Send Alerts</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Broadcast messages to members</p>
          </div>

          {/* Form Toggle Switch */}
          <div className="flex bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setAlertType("direct")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                alertType === "direct" 
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Direct Alert
            </button>
            <button
              onClick={() => setAlertType("global")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                alertType === "global" 
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Broadcast (All Users)
            </button>
          </div>

          {alertType === "direct" ? (
            <form onSubmit={handleSendDirect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Recipient</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Overdue Warning"
                  value={directTitle}
                  onChange={(e) => setDirectTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Message Body</label>
                <textarea
                  placeholder="Type direct message..."
                  value={directMessage}
                  onChange={(e) => setDirectMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
              >
                Send Alert
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendGlobal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Announcement Heading</label>
                <input
                  type="text"
                  placeholder="e.g. Library Closure Tomorrow"
                  value={globalTitle}
                  onChange={(e) => setGlobalTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Announcement Details</label>
                <textarea
                  placeholder="Type broadcast message..."
                  value={globalMessage}
                  onChange={(e) => setGlobalMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                Broadcast Announcement
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Sent Notifications Log */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-slate-100 rounded-2xl p-5 sm:p-6 flex flex-col max-h-[85vh]">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Alerts History Log</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">List of all active notices & direct messages</p>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 scrollbar-thin">
            {sentLog.length === 0 ? (
              <p className="text-slate-400 text-center py-10 italic">No sent notification history.</p>
            ) : (
              sentLog.map((n) => (
                <div key={n._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{n.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        n.type === 'announcement' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>To: <b>{n.user?.name || "Deleted User"}</b> ({n.user?.email || "N/A"})</span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(n._id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors shrink-0"
                    title="Delete Notification"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    );
  }

  // Render User Layout: Personal Alerts
  return (
    <div className="bg-white shadow rounded-xl p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 border-b pb-4">My Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-slate-500 text-center py-10 italic">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div key={n._id} className="p-4 bg-slate-50 border rounded-xl flex items-start gap-3">
              <div className="mt-1">
                {n.type === 'overdue' ? (
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                ) : (
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">{n.title}</h2>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{n.message}</p>
                <div className="flex gap-2 text-[10px] text-slate-400 mt-2">
                  <span className="uppercase font-bold tracking-wider">{n.type}</span>
                  <span>•</span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
