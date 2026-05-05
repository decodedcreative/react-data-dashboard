'use client';

import type { PropsWithChildren } from 'react';
import { useGetClassNames } from '@hooks/useGetClassNames';
import classNames from './app-nav.styles';

export type NavProps = PropsWithChildren;

export const Nav = ({ children }: NavProps) => {
  const navClassNames = useGetClassNames(classNames);

  return (
    <nav aria-label="Main" className={navClassNames.component}>
      {children}
    </nav>
  );
}

Nav.displayName = 'Nav';
