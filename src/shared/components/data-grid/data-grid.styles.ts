import type { CSSProperties } from 'react';
import { cva } from 'class-variance-authority';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const classNames = {
  component: cva(['ag-theme-quartz', 'w-full']),
};

/**
 * Uses Tailwind v4 token variables as AG Grid theme inputs.
 * Tokens can be tuned later in app theme configuration without changing this component.
 */
export const dataGridThemeVariables: CSSProperties = {
  '--ag-background-color': 'var(--color-white)',
  '--ag-foreground-color': 'var(--color-neutral-900)',
  '--ag-border-color': 'var(--color-neutral-200)',
  '--ag-header-background-color': 'var(--color-neutral-50)',
  '--ag-header-foreground-color': 'var(--color-neutral-900)',
  '--ag-selected-row-background-color':
    'color-mix(in srgb, var(--color-blue-500) 14%, transparent)',
  '--ag-row-hover-color':
    'color-mix(in srgb, var(--color-neutral-900) 6%, transparent)',
  '--ag-font-family': 'var(--font-sans)',
} as CSSProperties;

export const defaultContainerStyle: CSSProperties = {
  width: '100%',
  height: 'min(70vh, 560px)',
  ...dataGridThemeVariables,
};

export default classNames;
