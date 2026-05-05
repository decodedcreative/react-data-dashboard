import { cva } from 'class-variance-authority';

const classNames = {
  link: cva(
    [
      'text-neutral-800',
      'no-underline',
      'outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-neutral-400',
      'focus-visible:ring-offset-2',
      'rounded-sm',
    ],
    {
      variants: {
        active: {
          true: 'font-semibold',
        },
      },
      defaultVariants: {
        active: false,
      },
    }
  ),
};

export default classNames;
