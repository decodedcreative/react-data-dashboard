import { cva } from 'class-variance-authority';

const classNames = {
  component: cva([
    'flex',
    'flex-wrap',
    'items-center',
    'gap-4',
    'border-b',
    'border-neutral-300',
    'px-4',
    'py-3',
  ]),
};

export default classNames;
