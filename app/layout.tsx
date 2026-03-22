import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
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
  title: 'The NextGen Healthcare Marketing | Healthcare Growth & Automation',
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
      <head>
        {/* Preconnect to third-party origins used above the fold */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YNRRWLKFB4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YNRRWLKFB4');
          `}
        </Script>
      </head>
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
