import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookOpen, Mail, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-center min-h-[72vh]">
      <div className="hidden lg:block rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="relative bg-white/10 w-fit p-4 rounded-3xl mb-8"><BookOpen size={42} /></div>
        <h1 className="relative text-5xl font-black leading-tight">Create your digital library account</h1>
        <p className="relative text-slate-300 text-lg mt-5">Borrow books, view notifications, manage payments and track your profile easily.</p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="w-full max-w-md mx-auto glass-card rounded-[2rem] p-7 sm:p-9 space-y-5">
        <div>
          <p className="text-blue-600 font-bold">Register</p>
          <h2 className="text-3xl font-black text-slate-950">Create Account</h2>
        </div>

        <label className="block space-y-2"><span className="text-sm font-bold text-slate-600">Full Name</span><div className="relative"><UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input name="name" required autoComplete="new-password" className="soft-input pl-12" placeholder="Your name" value={form.name} onChange={handleChange} /></div></label>
        <label className="block space-y-2"><span className="text-sm font-bold text-slate-600">Email</span><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input name="email" type="email" required autoComplete="new-password" className="soft-input pl-12" placeholder="you@example.com" value={form.email} onChange={handleChange} /></div></label>
        <label className="block space-y-2"><span className="text-sm font-bold text-slate-600">Password</span><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input name="password" type="password" required autoComplete="new-password" className="soft-input pl-12" placeholder="Create password" value={form.password} onChange={handleChange} /></div></label>

        <button type="submit" disabled={isLoading} className={`w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>

        <p className="text-center text-slate-600 text-sm">Already have an account? <Link className="text-blue-600 font-black hover:underline" to="/login">Login here</Link></p>
      </form>
    </div>
  );
}
