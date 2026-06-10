import { useEffect, useState } from 'react';
import { RotateCcw, BookOpen } from 'lucide-react';
import api from '../api/axios';
import BookCard from '../components/BookCard';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ search: '', genre: '', status: '' });
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get(`/books?${params}`);
      setBooks(data.books || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(loadBooks, 150);
    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 p-6 sm:p-8 text-white shadow-xl shadow-blue-600/20">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-bold text-blue-100">Library Catalog</p>
            <h1 className="text-3xl sm:text-5xl font-black mt-1">Explore Books</h1>
            <p className="text-blue-50 mt-3 max-w-2xl">Search by title, author, ISBN, genre and availability.</p>
          </div>
          <div className="rounded-3xl bg-white/15 border border-white/20 px-5 py-4">
            <BookOpen size={26} />
            <p className="font-black text-2xl mt-1">{books.length}</p>
            <p className="text-sm text-blue-50">books showing</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5 rounded-3xl grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
       <div className="sm:col-span-2">
  <input
    name="search"
    className="soft-input px-4"
    placeholder="Search title, author, ISBN..."
    value={filters.search}
    onChange={handleFilterChange}
  />
</div>
        <input name="genre" className="soft-input px-4" placeholder="Genre" value={filters.genre} onChange={handleFilterChange} />
        <select name="status" className="soft-input px-4" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <button onClick={() => setFilters({ search: '', genre: '', status: '' })} className="sm:col-span-2 lg:col-span-4 bg-slate-950 hover:bg-slate-800 text-white p-3 rounded-2xl transition-colors font-bold flex items-center justify-center gap-2">
          <RotateCcw size={17} /> Reset Catalog Filters
        </button>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-3xl text-center py-14 text-slate-500 font-semibold">Loading books...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {books.length > 0 ? books.map((book) => <BookCard key={book._id} book={book} />) : (
            <div className="col-span-full glass-card rounded-3xl text-center py-14 text-slate-500 font-semibold">No books found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}
