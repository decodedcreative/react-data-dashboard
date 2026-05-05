'use client';

import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { useThemeProvider } from '@app/theme-provider';
import type { CvaSlotFn } from '@lib/get-class-names';
import { getClassNames } from '@lib/get-class-names';

export const useGetClassNames = <K extends string>(
  classNames: Record<K, CvaSlotFn>,
  classNameOverrides: Partial<Record<K, string[]>> = {},
  props?: Partial<Record<K, object>>,
  /** Only merge these slots when you cannot pass all variant props in one call (e.g. multiple links). */
  slotKeys?: readonly K[]
) => {
  const theme = useThemeProvider();
  const twMergeFn = theme?.twMerge ?? twMerge;

  return useMemo(
    () =>
      getClassNames(classNames, classNameOverrides, props, {
        slotKeys,
        twMergeFn,
      }),
    [classNames, classNameOverrides, props, slotKeys, twMergeFn]
  );
}
