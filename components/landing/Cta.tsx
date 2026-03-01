'use client';
export default function Cta() {
  return (
    <div id="contact" className="text-center bg-emerald-50 p-12 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-slate-900">Ready to grow your practice?</h2>
      <p className="mt-3 text-slate-700">Schedule a free site & marketing audit and get a clear action plan.</p>
      <div className="mt-6">
        <a href="/contact" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded hover:bg-emerald-500">Book a Free Audit</a>
      </div>
    </div>
  );
}
