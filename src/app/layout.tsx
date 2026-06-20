import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: 'Property management SaaS for Kenyan high-rise buildings with native M-Pesa integration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
