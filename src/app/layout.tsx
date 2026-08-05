import type { Metadata } from 'next';
import '@jigsaw-ds/tokens/shared/base.css';
import '@jigsaw-ds/theme-default/base.css';
import '@jigsaw-ds/theme-default/semantic-light.css';
import '@jigsaw-ds/theme-default/semantic-dark.css';
import './globals.css';
import { Nav, NavLink } from '@shared/components/nav';
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
