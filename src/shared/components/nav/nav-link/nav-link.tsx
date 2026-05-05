'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGetClassNames } from '@hooks/use-get-class-names';
import classNames from './nav-link.styles';

const linkIsActive = (pathname: string, href: string): boolean => {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = linkIsActive(pathname, href);

  const { link: linkClassName } = useGetClassNames(classNames, undefined, {
    link: { isActive },
  });

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={linkClassName}
    >
      {children}
    </Link>
  );
}

NavLink.displayName = 'RDDB_Nav_Link';
