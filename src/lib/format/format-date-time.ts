import { DISPLAY_LOCALE, DISPLAY_TIME_ZONE } from '@lib/config';

type DateTimeInput = string | number | Date;

type FormatDateTimeOptions = {
  locale?: string;
  timeZone?: string;
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
};

export const formatDateTime = (
  value: DateTimeInput | null | undefined,
  options: FormatDateTimeOptions = {}
): string => {
  if (value == null) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const {
    locale = DISPLAY_LOCALE,
    timeZone = DISPLAY_TIME_ZONE,
    dateStyle = 'medium',
    timeStyle = 'short',
  } = options;

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle,
    timeZone,
  }).format(date);
};
