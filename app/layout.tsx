import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import LoadingScreen from '@/components/LoadingScreen';
import ScrollToTop from '@/components/ScrollToTop';
import { SitePreferencesProvider } from '@/components/SitePreferencesProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'NextGen Marketing Agency | Healthcare Growth & Automation',
  description: 'The Operating System for Clinical Growth. Specialized in ER, Urgent Care, and Wellness clinic marketing automation.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} theme-light`}>
      <body suppressHydrationWarning className="antialiased selection:bg-emerald-500/30">
        <SitePreferencesProvider>
          <ScrollToTop />
          <LoadingScreen />
          {children}
          <CookieConsent />
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
