import { useEffect, useState } from 'react';
import api from '../api/axios';
import BookCard from '../components/BookCard';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ search: '', genre: '', status: '' });
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      // Build query params dynamically, filtering out empty values
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v)
      );
      const { data } = await api.get(`/books?${params}`);
      setBooks(data.books);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBooks();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 grid md:grid-cols-4 gap-4">
        <input
          name="search"
          className="border p-3 rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Search title, author, ISBN..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          name="genre"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Genre"
          value={filters.genre}
          onChange={handleFilterChange}
        />
        <select
          name="status"
          className="border p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        
        <button 
          onClick={loadBooks} 
          className="md:col-span-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {isLoading ? 'Searching...' : 'Search Books'}
        </button>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Loading books...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.length > 0 ? (
            books.map((book) => <BookCard key={book._id} book={book} />)
          ) : (
            <div className="col-span-full text-center py-10 text-slate-500">
              No books found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}