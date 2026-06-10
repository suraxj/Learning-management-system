import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  IndianRupee,
  ArrowRight,
  Search,
  Star,
  BookMarked, 
  UsersRound,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getBorrowStatus = (b) => {
    if (b.status === "returned") return "returned";
    if (b.dueDate && new Date(b.dueDate) < new Date()) return "overdue";
    return "borrowed";
  };

  const loadDashboardData = async () => {
    try {
      const { data } = await api.get("/books");
      setBooks(data.books || []);
    } catch {
      setBooks([]);
    }

    if (!user) {
      setBorrowings([]);
      setNotifications([]);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setBorrowings(data.borrowings || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const activeBorrowings = borrowings.filter((b) =>
    ["borrowed", "overdue"].includes(getBorrowStatus(b))
  );
  const overdue = borrowings.filter((b) => getBorrowStatus(b) === "overdue").length;
  const pendingFines = borrowings.reduce(
    (sum, b) => (b.finePaid ? sum : sum + Number(b.fine || 0)),
    0
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/books");
    }
  };

  // Top books grid from database
  const topBooks = books.slice(0, 8);

  const genres = [
    { name: "Fiction", count: "1,200+ Books", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "Classic", count: "850+ Books", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { name: "Fantasy", count: "600+ Books", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { name: "Dystopian", count: "400+ Books", color: "bg-amber-50 text-amber-600 border-amber-100" },
    { name: "Biography", count: "950+ Books", color: "bg-rose-50 text-rose-600 border-rose-100" },
    { name: "Science", count: "750+ Books", color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  ];

  const publishers = [
    { name: "Penguin Books", logo: "PB" },
    { name: "HarperCollins", logo: "HC" },
    { name: "Oxford Press", logo: "OUP" },
    { name: "Macmillan", logo: "MM" },
    { name: "Pearson Education", logo: "PE" },
    { name: "Springer", logo: "SP" },
  ];

  const testimonials = [
    {
      name: "Rohan Sharma",
      role: "Engineering Student",
      rating: 5,
      comment: "The online booking and payment integration with Stripe makes borrowing extremely fast and hassle-free!",
      avatar: "R",
    },
    {
      name: "Anjali Gupta",
      role: "Classic Literature Reader",
      rating: 5,
      comment: "Superb interface! The automated email notification when a reserved book becomes available is very helpful.",
      avatar: "A",
    },
    {
      name: "Sunil Verma",
      role: "Research Scholar",
      rating: 4,
      comment: "I love the dashboard stats. It keeps my borrowings and fine updates transparent and simple to manage.",
      avatar: "S",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. HERO SECTION (CareerKaka style) */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#ebf4ff] to-[#e1edff] border border-blue-100 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-300/15 blur-3xl" />
        
        <div className="relative grid lg:grid-cols-[1.2fr_.8fr] gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Welcome To <br />
              <span className="text-[#0077d6]">"LMS Library"</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl">
              Your Knowledge, Our Guidance! Browse thousands of curated titles, reserve in-demand textbooks, and track borrowings online.
            </p>

            {/* CareerKaka Search box */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg bg-white p-2 rounded-2xl border border-slate-200/80 shadow-md shadow-blue-900/5">
              <div className="flex-1 flex items-center gap-2.5 px-3">
                <Search className="text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter book title, author, or ISBN..."
                  className="w-full text-sm outline-none text-slate-800 bg-transparent py-2.5"
                />
              </div>
              <button
                type="submit"
                className="bg-[#0077d6] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
              >
                Search Catalog
              </button>
            </form>
          </div>

          {/* Student Banner Photo Graphic */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-80 h-96 bg-white rounded-3xl p-3 shadow-xl shadow-blue-900/5 border border-slate-100 rotate-1">
              <img
                   src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
                   alt="Library Books"
                   className="w-full h-full object-cover rounded-2xl"
                />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md rounded-2xl p-4 text-white text-left">
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (CareerKaka style) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Total Books", value: books.length || "5,000+", subtitle: "Catalog capacity", icon: BookMarked },
          { label: "Active Members", value: user ? "100+" : "Guest", subtitle: "LMS Members", icon: UsersRound },
          { label: "Currently Borrowed", value: activeBorrowings.length, subtitle: `${overdue} overdue items`, icon: Clock },
          { label: "Pending Fines", value: `₹${pendingFines}`, subtitle: "Secure fine payments", icon: IndianRupee },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white border-t-4 border-[#0077d6] rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wide">
                  {item.label}
                </span>
                <Icon size={18} className="text-[#0077d6]" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{item.value}</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. DEPARTMENTS/GENRES EXPLORER (CareerKaka style) */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-xs font-black uppercase text-[#0077d6] tracking-widest">
            Book Genres
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900">
            Explore Popular Genres
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Search books across major subjects and academic departments
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {genres.map((g, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/books?genre=${g.name}`)}
              className={`p-5 rounded-2xl border text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 ${g.color}`}
            >
              <BookOpen className="mx-auto mb-3" size={24} />
              <b className="block text-slate-900 text-sm font-black">{g.name}</b>
              <span className="text-xs opacity-80 font-bold block mt-1">{g.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BOOK CATALOG LISTING (CareerKaka Top Colleges Style) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs font-black uppercase text-[#0077d6] tracking-widest">
              LMS Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900">
              Featured Catalog Books
            </h2>
          </div>
          <Link
            to="/books"
            className="flex items-center gap-1.5 text-sm font-black text-[#0077d6] hover:text-blue-700 transition-colors"
          >
            See All Books <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topBooks.length === 0 ? (
            <div className="col-span-full bg-white border rounded-3xl text-center py-12 text-slate-500 font-semibold">
              Loading featured books...
            </div>
          ) : (
            topBooks.map((book) => {
              const available = Number(book.availableCopies || 0) > 0;
              return (
                <div
                  key={book._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-slate-50 overflow-hidden shrink-0">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                        <BookOpen size={44} />
                        <span className="text-xs font-bold mt-1.5">No Cover</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-4 left-4 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        available
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {available ? "Available" : "Checked Out"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-left">
                    <div>
                      <h4 className="font-black text-slate-900 text-base line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-bold">
                        by {book.author || "Unknown"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                        {book.genre || "General"}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                        <Star size={13} className="fill-current" /> {book.averageRating || "0.0"}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-500 flex justify-between items-center">
                      <span>Available:</span>
                      <b className="text-slate-900">
                        {book.availableCopies} / {book.copies}
                      </b>
                    </div>

                    <Link
                      to={`/books/${book._id}`}
                      className="block w-full text-center bg-[#0077d6] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. PUBLISHERS LOGOS ("Find Top Recruiter" style) */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-xs font-black uppercase text-[#0077d6] tracking-widest">
            Publishers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900">
            Our Knowledge Partners
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Access materials from top publishers and university presses globally
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-slate-50 border rounded-2.5rem p-6 sm:p-8">
          {publishers.map((p, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-2xl px-6 py-4 flex items-center justify-center gap-2 shadow-sm font-black text-slate-800 text-sm tracking-tight border-slate-200"
            >
              <div className="w-6 h-6 rounded bg-[#0077d6] text-white text-[10px] flex items-center justify-center">
                {p.logo}
              </div>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS SLIDER SECTION (CareerKaka style) */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-xs font-black uppercase text-[#0077d6] tracking-widest">
            Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900">
            What Our Students Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < t.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-semibold italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">{t.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. DETAILED NAVY FOOTER (CareerKaka style) */}
      <footer className="bg-[#0b172a] rounded-[2rem] text-white p-8 sm:p-12 overflow-hidden relative">
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left border-b border-white/10 pb-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-2xl font-black tracking-tight">
              LMS <span className="text-[#0077d6]">Library</span>
            </h3>
            <p className="text-sm text-slate-400 font-medium max-w-sm leading-relaxed">
              LMS Library provides students and faculty members seamless access to digital book catalogs, secure borrow checkout sessions, and local late-return fine management.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-sm uppercase text-slate-300">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-semibold">
              <li><Link to="/books" className="hover:text-white transition-colors">Book Catalog</Link></li>
              {user ? (
                <>
                  <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                  <li><Link to="/notifications" className="hover:text-white transition-colors">Alerts</Link></li>
                </>
              ) : (
                <li><Link to="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-sm uppercase text-slate-300">Contact Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-semibold">
              <li>support@lmsuniversity.edu</li>
              <li>+91 (0124) 456-7890</li>
              <li>Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
          <span>Copyright © 2026 LMS University. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
