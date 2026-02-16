import type { Metadata, Viewport } from 'next';
import { Stick } from 'next/font/google';
import './globals.css';

const stick = Stick({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-stick',
});

export const metadata: Metadata = {
  title: '熾火守',
  description: 'Simple stand maintenance tracker',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${stick.variable}`}>
      <body className="bg-slate-900 text-slate-50">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
