import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shadow Protocol',
  description: 'Privacy-preserving auctions powered by zero-knowledge cryptography',
  keywords: ['auction', 'privacy', 'blockchain', 'solana', 'MPC', 'zero-knowledge'],
  authors: [{ name: 'Shadow Protocol' }],
  openGraph: {
    title: 'Shadow Protocol',
    description: 'Privacy-preserving auctions powered by zero-knowledge cryptography',
    type: 'website',
    url: 'https://shadowprotocol.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shadow Protocol',
    description: 'Privacy-preserving auctions powered by zero-knowledge cryptography',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
        <div className="noise-overlay" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}