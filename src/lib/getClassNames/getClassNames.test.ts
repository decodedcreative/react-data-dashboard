import { cva } from 'class-variance-authority';
import { describe, expect, it } from 'vitest';
import { getClassNames } from './getClassNames';

describe('getClassNames', () => {
  it('returns merged class names for all slots by default', () => {
    const classNames = {
      component: cva(['px-2', 'py-1']),
      title: cva(['font-semibold']),
    };

    const result = getClassNames(classNames);

    expect(result.component).toBe('px-2 py-1');
    expect(result.title).toBe('font-semibold');
  });

  it('applies variant props and override classes', () => {
    const classNames = {
      link: cva(['text-neutral-800'], {
        variants: {
          active: {
            true: 'font-semibold',
          },
        },
      }),
    };

    const result = getClassNames(
      classNames,
      { link: ['text-neutral-900'] },
      { link: { active: true } }
    );

    expect(result.link).toContain('font-semibold');
    expect(result.link).toContain('text-neutral-900');
  });

  it('respects slotKeys and only computes requested slots', () => {
    const classNames = {
      component: cva(['px-2']),
      title: cva(['text-lg']),
    };

    const result = getClassNames<'component' | 'title'>(classNames, {}, {}, {
      slotKeys: ['title'],
    });

    expect(result.title).toBe('text-lg');
    expect('component' in result).toBe(false);
  });

  it('uses provided twMerge function override', () => {
    const classNames = {
      component: cva(['text-neutral-800']),
    };

    const result = getClassNames(
      classNames,
      { component: ['text-neutral-900'] },
      {},
      {
        twMergeFn: ((...classes: unknown[]) => classes.filter(Boolean).join(' | ')) as typeof import('tailwind-merge').twMerge,
      }
    );

    expect(result.component).toBe('text-neutral-800 | text-neutral-900');
  });
});
