import { cva } from 'class-variance-authority';

const classNames = {
  component: cva(['flex', 'flex-col', 'gap-4']),
  toolbar: cva([
    'flex',
    'flex-col',
    'gap-3',
    'sm:flex-row',
    'sm:items-center',
    'sm:justify-between',
  ]),
  controlsGroup: cva(['flex', 'items-center', 'gap-3']),
  liveIndicator: cva([
    'inline-flex',
    'items-center',
    'gap-1.5',
    'text-xs',
    'font-medium',
    'text-neutral-600',
  ]),
  liveDot: cva([
    'h-2',
    'w-2',
    'rounded-full',
    'bg-emerald-500',
    'animate-pulse',
  ]),
  searchWrapper: cva(['w-full', 'sm:max-w-xs']),
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
