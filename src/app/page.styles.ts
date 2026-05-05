import { cva } from 'class-variance-authority';

const classNames = {
  component: cva(['max-w-2xl', 'px-4', 'py-4']),
  title: cva(['mt-0', 'text-3xl', 'font-semibold', 'text-neutral-900']),
  paragraph: cva(['text-neutral-800']),
  link: cva([
    'text-neutral-900',
    'underline-offset-2',
    'hover:underline',
    'focus-visible:rounded-sm',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-neutral-400',
    'focus-visible:ring-offset-2',
  ]),
};

export default classNames;
