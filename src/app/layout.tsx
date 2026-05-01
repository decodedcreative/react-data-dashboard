import type { Metadata } from 'next';

import './globals.css';

import { AppNav } from '@/shared/components/AppNav';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'React Data Dashboard',
  description: 'Trade data explorer and dashboards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
