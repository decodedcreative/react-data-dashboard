import { DISPLAY_CURRENCY, DISPLAY_LOCALE } from '@lib/config';

type FormatCurrencyOptions = {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export const formatCurrency = (
  value: number | null | undefined,
  options: FormatCurrencyOptions = {}
): string => {
  if (value == null || Number.isNaN(value)) return '';

  const {
    currency = DISPLAY_CURRENCY,
    locale = DISPLAY_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};
