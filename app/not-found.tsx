import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center py-32">
        <h1 className="text-[118px] font-bold text-emerald-500 mb-8 tracking-tighter">404</h1>
        <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to clinical growth.
        </p>
        <Link 
          href="/" 
          className="inline-block rounded-full bg-emerald-500 px-12 py-5 text-xl font-bold text-black hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
        >
          Back to Home
        </Link>
      </div>
      <Footer />
    </main>
  );
}
