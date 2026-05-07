import type { Metadata } from 'next';
import './globals.css';
import { Nav, NavLink } from '@shared/components/nav';
import { assertDatabaseUrlConfigured } from '@lib/server/database-url';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'React Data Dashboard',
  description: 'Trade data explorer and dashboards',
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  assertDatabaseUrlConfigured();

  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/trades">Trades</NavLink>
            <NavLink href="/about">About</NavLink>
          </Nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
