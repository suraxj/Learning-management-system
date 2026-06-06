import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>

        <input
          name="name"
          required
          autoComplete="new-password"
          className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          required
          autoComplete="new-password"
          className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Email Address"
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

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white p-3 rounded-lg font-semibold transition-all ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>

        <p className="text-center text-slate-600 text-sm">
          Already have an account?{' '}
          <Link className="text-blue-600 font-semibold hover:underline" to="/login">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}