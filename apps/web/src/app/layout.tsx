import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shadow Protocol - Privacy-Preserving Auctions',
  description: 'The first truly private auction platform on Solana. Create and participate in sealed-bid auctions with complete privacy.',
  keywords: ['auction', 'privacy', 'blockchain', 'solana', 'sealed-bid', 'dutch auction'],
  authors: [{ name: 'Shadow Protocol Team' }],
  openGraph: {
    title: 'Shadow Protocol',
    description: 'Privacy-Preserving Auctions on Solana',
    type: 'website',
    url: 'https://shadowprotocol.xyz',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shadow Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shadow Protocol',
    description: 'Privacy-Preserving Auctions on Solana',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-shadow-50 to-shadow-100`}>
        <Providers>
          <div className="min-h-full flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}