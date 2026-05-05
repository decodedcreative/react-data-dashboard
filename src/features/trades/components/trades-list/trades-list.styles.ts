import { cva } from 'class-variance-authority';

const classNames = {
  list: cva(['m-0', 'list-none', 'space-y-2', 'p-0']),
  listItem: cva(['text-neutral-800']),
  symbolLink: cva([
    'font-medium',
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
