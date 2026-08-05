import { cva } from 'class-variance-authority';

const classNames = {
  component: cva(['max-w-2xl', 'px-4', 'py-4']),
  title: cva(['m-0', 'text-2xl', 'font-semibold', 'text-neutral-900']),
  tradeIdText: cva(['mb-2', 'mt-1']),
  tradeIdCode: cva(['rounded-sm', 'bg-neutral-100', 'px-1.5', 'py-0.5', 'text-sm']),
  details: cva(['flex', 'flex-col', 'gap-2.5']),
  row: cva(['flex', 'flex-col']),
  label: cva(['text-xs', 'text-neutral-600']),
  value: cva(['text-neutral-900']),
  backLinkWrap: cva(['mt-6']),
};

export default classNames;
