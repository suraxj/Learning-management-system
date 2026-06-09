import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookOpen, LockKeyhole, Mail } from 'lucide-react';
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
    <div className="grid lg:grid-cols-2 gap-6 items-center min-h-[72vh]">
      <div className="hidden lg:block rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-10 text-white shadow-2xl shadow-blue-600/20">
        <div className="bg-white/15 w-fit p-4 rounded-3xl mb-8"><BookOpen size={42} /></div>
        <h1 className="text-5xl font-black leading-tight">Welcome back to Smart Library</h1>
        <p className="text-blue-50 text-lg mt-5">Manage books, borrowings, reservations, fines and notifications from one clean dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="w-full max-w-md mx-auto glass-card rounded-[2rem] p-7 sm:p-9 space-y-5">
        <div>
          <p className="text-blue-600 font-bold">Login</p>
          <h2 className="text-3xl font-black text-slate-950">Access your account</h2>
        </div>

       <label className="block space-y-2">
  <span className="text-sm font-bold text-slate-600">Email</span>
  <input
    name="email"
    type="email"
    required
    autoComplete="new-password"
    className="soft-input px-4"
    placeholder="you@example.com"
    value={form.email}
    onChange={handleChange}
  />
</label>

<label className="block space-y-2">
  <span className="text-sm font-bold text-slate-600">Password</span>
  <input
    name="password"
    type="password"
    required
    autoComplete="new-password"
    className="soft-input px-4"
    placeholder="Enter password"
    value={form.password}
    onChange={handleChange}
  />
</label>

        <div className="flex justify-end"><Link className="text-sm text-blue-600 font-semibold hover:underline" to="/forgot-password">Forgot password?</Link></div>

        <button type="submit" disabled={isLoading} className={`w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-slate-600 text-sm">New user? <Link className="text-blue-600 font-black hover:underline" to="/register">Register here</Link></p>
      </form>
    </div>
  );
}
