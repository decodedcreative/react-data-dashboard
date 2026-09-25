import { cva } from 'class-variance-authority';

const classNames = {
  container: cva([
    'grid',
    'grid-cols-2',
    'gap-3',
    'sm:grid-cols-4',
    'lg:grid-cols-6',
  ]),
  card: cva([
    'flex',
    'flex-col',
    'gap-1',
    'rounded-lg',
    'border',
    'border-neutral-200',
    'bg-white',
    'p-4',
    'shadow-xs',
  ]),
  label: cva([
    'text-xs',
    'font-medium',
    'text-neutral-500',
    'uppercase',
    'tracking-wider',
  ]),
  value: cva(['text-xl', 'font-semibold', 'text-neutral-900']),
};

export default classNames;
