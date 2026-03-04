'use client';

import { ReactNode } from 'react';
import { AdminPreferencesProvider } from '@/components/AdminPreferencesProvider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminPreferencesProvider>
      {children}
    </AdminPreferencesProvider>
  );
}
