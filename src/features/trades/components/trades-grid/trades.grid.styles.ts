import { cva } from 'class-variance-authority';

const classNames = {
  component: cva(['flex', 'flex-col', 'gap-3']),
  grid: cva(['rounded-lg', 'border', 'border-neutral-200', 'bg-white']),
  staleWarning: cva([
    'flex',
    'items-center',
    'justify-between',
    'gap-3',
    'rounded-lg',
    'border',
    'border-amber-300',
    'bg-amber-50',
    'px-3',
    'py-2',
    'text-sm',
    'text-amber-900',
  ]),
};

export default classNames;
