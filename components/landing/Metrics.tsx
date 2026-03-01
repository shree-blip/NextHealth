'use client';

export default function Metrics() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img src="/shree-gauli.png" alt="Shree Gauli" className="h-24 w-24 rounded-full object-cover" />
            <div>
              <div className="font-bold">Shree Gauli</div>
              <div className="text-sm text-slate-600">Chief Marketing Officer</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <img src="/team1.jpg" alt="CEO" className="h-24 w-24 rounded-full object-cover" />
            <div>
              <div className="font-bold">Jane Doe</div>
              <div className="text-sm text-slate-600">CEO &amp; Founder</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <img src="/team2.jpg" alt="Design Lead" className="h-24 w-24 rounded-full object-cover" />
            <div>
              <div className="font-bold">John Smith</div>
              <div className="text-sm text-slate-600">Design Lead</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[
            '350+ Projects Completed',
            '5.0 Clutch Rating',
            '5000+ Screens Designed',
            '70+ Happy Clients',
          ].map((m, i) => (
            <div key={i} className="p-6 bg-emerald-50 rounded-lg text-center">
              <div className="font-bold text-xl text-slate-900">{m}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
