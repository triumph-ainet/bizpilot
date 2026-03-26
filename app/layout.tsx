import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import { ToastProvider } from '@/components/ui';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BizPilot — Run your business on autopilot',
  description: 'Orders, payments and inventory — handled automatically for African SMEs.',
  icons: { icon: '/logo.webp' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
      <body className="font-dm bg-cream min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
