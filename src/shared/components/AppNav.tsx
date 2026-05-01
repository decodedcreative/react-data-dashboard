'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/trades', label: 'Trades' },
  { href: '/about', label: 'About' },
] as const;

function linkIsActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      style={{ padding: '12px 1rem', borderBottom: '1px solid #ccc' }}
    >
      {items.map(({ href, label }) => {
        const active = linkIsActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            style={{
              marginRight: '1rem',
              textDecoration: 'none',
              fontWeight: active ? 600 : 400,
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
