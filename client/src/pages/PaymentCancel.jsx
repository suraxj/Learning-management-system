import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <div className="flex justify-center items-center min-h-[50vh] p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          {/* Simple X icon representation */}
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Payment Cancelled</h1>
        <p className="text-slate-600 mt-3 mb-8">
          It looks like the payment process was interrupted. You can try again whenever you're ready by visiting your profile.
        </p>

        <Link 
          to="/profile" 
          className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Profile
        </Link>
      </div>
    </div>
  );
}