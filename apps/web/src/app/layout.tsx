import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Airlytics.ai', template: '%s | Airlytics.ai' },
  description: 'AI-powered flight price intelligence. Stop guessing — start predicting.',
  keywords: ['flight price prediction', 'AI travel', 'price forecast', 'airfare intelligence'],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Airlytics.ai — Flight Price Intelligence',
    description: 'Buy at the right time, every time.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
