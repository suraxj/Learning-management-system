import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookOpen, LockKeyhole, Mail, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[75vh] py-4 sm:py-8">
      {/* Redesigned Left Card (Dark navy visual block like the footer) */}
      <div className="hidden lg:flex flex-col justify-between h-full rounded-[2.5rem] bg-gradient-to-br from-[#0b172a] to-[#1e293b] p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        
        <div className="space-y-6 relative">
          <div className="bg-[#0077d6] text-white w-fit p-3.5 rounded-2xl shadow-lg shadow-blue-500/25">
            <BookOpen size={30} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Welcome back to <span className="text-blue-400">LMS Library</span>
          </h1>
          <p className="text-slate-400 font-medium text-base leading-relaxed">
            Log in to manage your checked-out books, request reservations, view direct alerts, and settle active fine balances securely.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-3.5 relative">
          {[
            "Search and request from 5,000+ catalog titles",
            "Stripe-powered checkout fine payment integrations",
            "Real-time notifications for overdue returns"
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-300">
              <ChevronRight size={16} className="text-[#0077d6]" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Form Card */}
      <form onSubmit={handleSubmit} autoComplete="off" className="w-full max-w-md mx-auto bg-white border border-slate-200/80 shadow-md shadow-blue-900/5 rounded-[2.5rem] p-8 sm:p-10 space-y-6">
        <div>
          <span className="text-xs font-black uppercase text-[#0077d6] tracking-widest">Login</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Access your account</h2>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Email Address</span>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={16} />
              <input
                name="email"
                type="email"
                required
                autoComplete="new-password"
                className="soft-input pl-11 pr-4 text-sm font-semibold text-slate-800"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Password</span>
            <div className="relative flex items-center">
              <LockKeyhole className="absolute left-4 text-slate-400" size={16} />
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="soft-input pl-11 pr-4 text-sm font-semibold text-slate-800"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <Link className="text-xs text-[#0077d6] font-bold hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0077d6] hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login to Account'}
        </button>

        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-wide">
          New user?{' '}
          <Link className="text-[#0077d6] font-black hover:underline" to="/register">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
