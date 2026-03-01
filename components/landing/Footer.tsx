'use client';
export default function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h4 className="font-bold">Services</h4>
          <ul className="space-y-2">
            <li><a href="/services" className="text-slate-300 hover:text-white">All Services</a></li>
            <li><a href="/services/google-ads" className="text-slate-300 hover:text-white">Google Ads</a></li>
            <li><a href="/services/seo-local-search" className="text-slate-300 hover:text-white">Local SEO</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold">Industries</h4>
          <ul className="space-y-2">
            <li><a href="/industries" className="text-slate-300 hover:text-white">All Industries</a></li>
            <li><a href="/industries/healthcare" className="text-slate-300 hover:text-white">Healthcare</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold">Contact</h4>
          <p className="text-sm">1234 Marketing Ave<br/>Irving, TX</p>
          <p className="text-sm">(214) 555-0123</p>
          <div className="flex gap-3">
            <a href="#" className="text-slate-300 hover:text-white">Twitter</a>
            <a href="#" className="text-slate-300 hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </footer>
  );
}
