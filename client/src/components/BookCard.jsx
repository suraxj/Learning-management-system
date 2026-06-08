import { Link } from 'react-router-dom';
import { BookOpen, Star, UserRound, Layers } from 'lucide-react';

export default function BookCard({ book }) {
  const available = Number(book.availableCopies || 0) > 0;

  return (
    <div className="group overflow-hidden rounded-3xl bg-white/90 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-52 bg-gradient-to-br from-blue-100 via-white to-cyan-100 overflow-hidden">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-blue-500">
            <BookOpen size={54} />
            <span className="mt-2 font-semibold">No Cover</span>
          </div>
        )}

        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-black text-lg line-clamp-1 text-slate-950">{book.title}</h3>
          <p className="flex items-center gap-2 text-sm text-slate-500 mt-1"><UserRound size={15} /> {book.author || 'Unknown Author'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-600"><Layers size={14} className="inline mr-1" /> {book.genre || 'General'}</p>
          <p className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-700"><Star size={14} className="inline mr-1 fill-current" /> {book.averageRating || 0}/5</p>
        </div>

        <p className="text-sm text-slate-500">Copies: <b className="text-slate-900">{book.availableCopies}/{book.copies}</b></p>

        <Link to={`/books/${book._id}`} className="block w-full text-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-shadow">
          View Details
        </Link>
      </div>
    </div>
  );
}
