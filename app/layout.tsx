import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop';
import { SitePreferencesProvider } from '@/components/SitePreferencesProvider';
import { AuthProvider } from '@/components/AuthProvider';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
import GlobalEnhancements from '@/components/GlobalEnhancements';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'NexHealth Healthcare Marketing | Healthcare Growth & Automation',
  description: 'The Operating System for Clinical Growth. Specialized in ER, Urgent Care, and Wellness clinic marketing automation.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} theme-light overflow-y-scroll`}>
      <body suppressHydrationWarning className="antialiased selection:bg-emerald-500/30 overflow-x-hidden">
        <LocalBusinessSchema />
        <SitePreferencesProvider>
          <AuthProvider>
            <ScrollToTop />
            {children}
            <GlobalEnhancements />
          </AuthProvider>
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
