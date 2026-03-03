'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBlogPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin?view=blog-management');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
}
