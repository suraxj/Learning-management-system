import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function AdminAnnouncements() {
  const [form, setForm] = useState({ title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/notifications/announce', form);
      toast.success('Announcement sent successfully');
      setForm({ title: '', message: '' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send announcement';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-xl mx-auto bg-white shadow rounded-xl p-4 sm:p-6 space-y-4"
    >
      <h1 className="text-2xl font-bold">Send Announcement</h1>
      
      <input
        name="title"
        className="w-full border p-3 rounded"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      
      <textarea
        name="message"
        className="w-full border p-3 rounded h-32"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
        required
      />
      
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-blue-600 text-white p-3 rounded transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Sending...' : 'Send Announcement'}
      </button>
    </form>
  );
}