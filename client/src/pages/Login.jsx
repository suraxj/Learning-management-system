import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <form 
        onSubmit={handleSubmit} 
        autoComplete="off"
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-5 border border-slate-100"
      >
        <h2 className="text-2xl font-bold text-slate-900">Login</h2>
        
        <input
          name="email"
          type="email"
          required
          autoComplete="new-password"
          className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="flex justify-end">
          <Link className="text-sm text-blue-600 hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white p-3 rounded-lg font-semibold transition-all ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-slate-600 text-sm">
          New user?{' '}
          <Link className="text-blue-600 font-semibold hover:underline" to="/register">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}