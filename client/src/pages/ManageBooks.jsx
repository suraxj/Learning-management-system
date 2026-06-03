import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooks = async () => {
    try {
      const { data } = await api.get('/books');
      setBooks(data.books);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this book?')) return;

    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted successfully');
      loadBooks();
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading catalog...</div>;

  return (
    <div className="bg-white shadow-sm border border-slate-100 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Books</h1>
        <Link 
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium" 
          to="/admin/books/new"
        >
          + Add New Book
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3">Inventory</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((b) => (
              <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{b.title}</td>
                <td className="px-4 py-3 text-slate-600">{b.isbn}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${b.availableCopies === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {b.availableCopies}
                  </span> / {b.copies}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link 
                    className="text-blue-600 hover:text-blue-800 mr-4 font-medium" 
                    to={`/admin/books/${b._id}/edit`}
                  >
                    Edit
                  </Link>
                  <button 
                    className="text-red-600 hover:text-red-800 font-medium" 
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {books.length === 0 && (
        <p className="text-center py-10 text-slate-500">No books found in the system.</p>
      )}
    </div>
  );
}