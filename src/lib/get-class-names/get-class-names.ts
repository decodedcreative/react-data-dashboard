import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export type CvaSlotFn = ReturnType<typeof cva>;

export type GetClassNamesOptions<K extends string> = {
  slotKeys?: readonly K[];
  twMergeFn?: typeof twMerge;
};

export const getClassNames = <K extends string>(
  classNames: Record<K, CvaSlotFn>,
  classNameOverrides: Partial<Record<K, string[]>> = {},
  props?: Partial<Record<K, object>>,
  options?: GetClassNamesOptions<K>
): Partial<Record<K, string>> => {
  const twMergeFn = options?.twMergeFn ?? twMerge;
  const keys =
    options?.slotKeys ?? (Object.keys(classNames) as K[]);

  return keys.reduce((acc, key) => {
    const baseClasses = classNames[key](props?.[key] ?? {});
    const overrideClasses = classNameOverrides[key] ?? [];

    acc[key] = twMergeFn(baseClasses, overrideClasses.join(' '));
    return acc;
  }, {} as Partial<Record<K, string>>);
};
