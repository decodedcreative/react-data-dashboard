import { cva } from 'class-variance-authority';

const classNames = {
  component: cva(['px-4']),
  header: cva(['mb-4']),
  title: cva(['m-0', 'text-2xl', 'font-semibold', 'text-neutral-900']),
};

export default classNames;
