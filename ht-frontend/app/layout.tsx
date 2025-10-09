import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { EnhancedThemeProvider } from '@/lib/theme';
import { Toaster } from '@/components/ui/sonner';
import {
  SkipLinks,
  MainContentSkipLink,
  NavigationSkipLink,
} from '@/components/ui/skip-link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'HealthTracker - Track Your Health, Transform Your Life',
    template: '%s | HealthTracker',
  },
  description:
    'Monitor your daily water intake, food consumption, and workouts with our comprehensive health tracking platform. Get personalized insights and achieve your wellness goals.',
  keywords: [
    'health tracking',
    'fitness tracker',
    'nutrition monitoring',
    'water intake tracker',
    'workout logging',
    'wellness app',
    'health dashboard',
    'calorie counter',
    'exercise tracker',
    'health metrics',
  ],
  authors: [{ name: 'HealthTracker Team' }],
  creator: 'HealthTracker Team',
  publisher: 'HealthTracker',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://healthtracker.app',
    siteName: 'HealthTracker',
    title: 'HealthTracker - Track Your Health, Transform Your Life',
    description:
      'Monitor your daily water intake, food consumption, and workouts with our comprehensive health tracking platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HealthTracker - Health Monitoring Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HealthTracker - Track Your Health, Transform Your Life',
    description:
      'Monitor your daily water intake, food consumption, and workouts with our comprehensive health tracking platform.',
    images: ['/twitter-image.png'],
    creator: '@healthtracker',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://healthtracker.app',
  },
  category: 'Health & Fitness',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLinks>
          <MainContentSkipLink />
          <NavigationSkipLink />
        </SkipLinks>

        <EnhancedThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="ht-theme-v2"
          enableHighContrast={true}
          enableReducedMotion={true}
        >
          {children}
          <Toaster />
        </EnhancedThemeProvider>

        {/* Screen reader announcements container */}
        <div
          id="aria-live-announcer"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}
