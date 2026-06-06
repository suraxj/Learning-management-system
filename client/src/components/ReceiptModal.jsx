import React from "react";

export default function ReceiptModal({ payment, onClose }) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = payment._id ? payment._id.substring(payment._id.length - 8).toUpperCase() : "N/A";
  const formattedDate = new Date(payment.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const description = payment.paymentType === "borrow"
    ? `Borrow fee for book: "${payment.borrow?.book?.title || 'Unknown Title'}"`
    : `Late return fine for book: "${payment.borrow?.book?.title || 'Unknown Title'}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none print:max-h-none print:static print:w-full">
        
        {/* Header (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <span className="font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Transaction Receipt
          </span>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-8 space-y-6 overflow-y-auto print:overflow-visible print:p-0">
          
          {/* Library Brand Section */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">L</div>
                <span className="text-xl font-bold tracking-tight text-slate-900">LMS Library</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">100 Knowledge Hub Road, Campus Tower</p>
              <p className="text-xs text-slate-400">Email: library@learning-management.edu</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest font-bold text-blue-600 block">Invoice/Receipt</span>
              <span className="text-sm font-mono text-slate-600 block mt-1">#INV-{invoiceNumber}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Date: {formattedDate}</span>
            </div>
          </div>

          {/* Bill-to and Payment details */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl print:bg-white print:border print:p-4 print:rounded-none">
            <div>
              <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Billed To</span>
              <span className="block font-bold text-slate-800">{payment.user?.name || "Library Member"}</span>
              <span className="block text-xs text-slate-500">{payment.user?.email || "N/A"}</span>
            </div>
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Payment Method</span>
              <span className="block font-semibold text-slate-700">{payment.paymentMethod || "Digital Transfer"}</span>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase">
                {payment.status}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden print:border print:rounded-none">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b text-xs uppercase text-slate-500 font-bold print:bg-slate-50 print:border-b">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-4 font-medium">{description}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      {payment.paymentType === "borrow" ? "Borrow Fee" : "Overdue Fine"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">₹{payment.amount?.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50/50 print:bg-white">
                  <td colSpan="2" className="px-4 py-3 text-right font-semibold text-slate-500">Total Paid:</td>
                  <td className="px-4 py-3 text-right font-extrabold text-blue-600 text-lg">₹{payment.amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Stamp / Paid visualizer */}
          <div className="relative h-20 flex items-center justify-end">
            <div className="border-4 border-dashed border-green-600 text-green-600 font-black tracking-widest text-2xl px-6 py-2 rounded-lg transform rotate-[-12deg] opacity-75 mr-4 flex flex-col items-center select-none shadow-sm">
              <span>PAID</span>
              <span className="text-[9px] uppercase tracking-normal font-bold">LMS TRANSACTION SECURED</span>
            </div>
          </div>

          {/* Legal / Policy notice */}
          <div className="border-t pt-4 text-[10px] text-center text-slate-400 space-y-1">
            <p>This is a computer-generated official receipt. No physical signature is required.</p>
            <p>Thank you for using LMS Library services. Please return your books on time to avoid overdue charges.</p>
          </div>

        </div>

        {/* Footer actions (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 print:hidden">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          
          <button 
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-17v2m-3-2v2m6-2v2" />
            </svg>
            Print Receipt
          </button>
        </div>

      </div>

      {/* Global CSS to inject for print override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
