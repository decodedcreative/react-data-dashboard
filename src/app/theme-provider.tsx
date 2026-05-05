'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export type ThemeContextValue = {
  twMerge?: typeof twMerge;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({
  children,
  value,
}: PropsWithChildren<{ value?: ThemeContextValue }>) => {
  return (
    <ThemeContext.Provider value={value ?? {}}>{children}</ThemeContext.Provider>
  );
}

export const useThemeProvider = (): ThemeContextValue | undefined => {
  return useContext(ThemeContext);
}
