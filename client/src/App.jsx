import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PaymentHistory from "./pages/PaymentHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBooks from "./pages/ManageBooks";
import AddEditBook from "./pages/AddEditBook";
import Borrowings from "./pages/Borrowings";
import Reservations from "./pages/Reservations";
import ReviewsAdmin from "./pages/ReviewsAdmin";
import Reports from "./pages/Reports";
import AdminPayments from "./pages/AdminPayments";
import AdminAnnouncements from "./pages/AdminAnnouncements";

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  if (isAdminPath) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<RoleRoute roles={["admin", "librarian"]}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/books" element={<RoleRoute roles={["admin", "librarian"]}><ManageBooks /></RoleRoute>} />
          <Route path="/admin/books/new" element={<RoleRoute roles={["admin", "librarian"]}><AddEditBook /></RoleRoute>} />
          <Route path="/admin/books/:id/edit" element={<RoleRoute roles={["admin", "librarian"]}><AddEditBook /></RoleRoute>} />
          <Route path="/admin/borrowings" element={<RoleRoute roles={["admin", "librarian"]}><Borrowings /></RoleRoute>} />
          <Route path="/admin/reservations" element={<RoleRoute roles={["admin", "librarian"]}><Reservations /></RoleRoute>} />
          <Route path="/admin/reviews" element={<RoleRoute roles={["admin", "librarian"]}><ReviewsAdmin /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute roles={["admin", "librarian"]}><Reports /></RoleRoute>} />
          <Route path="/admin/payments" element={<RoleRoute roles={["admin", "librarian"]}><AdminPayments /></RoleRoute>} />
          <Route path="/admin/announcements" element={<RoleRoute roles={["admin"]}><AdminAnnouncements /></RoleRoute>} />
          <Route path="*" element={<div className="glass-card rounded-3xl p-10 text-center text-2xl font-bold">404 - Page Not Found</div>} />
        </Routes>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-5 sm:py-8 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/user" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

          <Route path="*" element={<div className="glass-card rounded-3xl p-10 text-center text-2xl font-bold">404 - Page Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}
