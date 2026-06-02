import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
      {/* Cover Image Section */}
      <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover rounded-lg"
          />
        ) : (
          'No Cover'
        )}
      </div>

      {/* Book Details */}
      <h3 className="font-bold text-lg">{book.title}</h3>
      <p className="text-sm text-slate-600">{book.author}</p>
      <p className="text-sm">Genre: {book.genre}</p>
      <p className="text-sm">
        Available: {book.availableCopies}/{book.copies}
      </p>
      <p className="text-sm">Rating: {book.averageRating || 0}/5</p>

      {/* Action Link */}
      <Link
        to={`/books/${book._id}`}
        className="mt-auto bg-blue-600 text-white text-center py-2 rounded"
      >
        View Details
      </Link>
    </div>
  );
}