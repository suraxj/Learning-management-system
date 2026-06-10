import { useState } from 'react';
import { toast } from 'react-toastify';
import { Mail, KeyRound } from 'lucide-react';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.warn('Please enter your email address');

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'Reset link sent to your email');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[65vh] p-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-white border border-slate-200/80 shadow-md shadow-blue-900/5 rounded-[2.5rem] p-8 sm:p-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto bg-blue-50 text-[#0077d6] w-fit p-3.5 rounded-2xl border border-blue-100">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Forgot Password</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <label className="block space-y-1.5 text-left">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Email Address</span>
          <div className="relative flex items-center">
            <Mail className="absolute left-4 text-slate-400" size={16} />
            <input
              type="email"
              required
              className="soft-input pl-11 pr-4 text-sm font-semibold text-slate-800"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0077d6] hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}