import type { CSSProperties } from 'react';
import { cva } from 'class-variance-authority';

const classNames = {
  component: cva(['w-full']),
};

export const defaultContainerStyle: CSSProperties = {
  width: '100%',
  height: 'min(70vh, 560px)',
};

export default classNames;
