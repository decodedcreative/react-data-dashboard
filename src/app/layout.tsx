import type { Metadata } from 'next';

import './globals.css';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
