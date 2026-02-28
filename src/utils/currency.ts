import { getCurrencyFormatter } from '@/stores/currencyStore';

/**
 * @deprecated Use getCurrencyFormatter() from '@/stores/currencyStore' or <Price /> component instead.
 * Kept only for backwards compatibility in edge cases.
 */
export const formatIDR = (amount: number): string => getCurrencyFormatter()(amount);

/**
 * Formats a number as plain number without currency symbol
 */
export const formatIDRPlain = (amount: number, locale: string = 'id-ID'): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Parses IDR string back to number
 */
export const parseIDR = (idrString: string): number => {
  return parseInt(idrString.replace(/[^\d]/g, '')) || 0;
};

/**
 * @deprecated Use getCurrencyFormatter() for range formatting
 */
export const formatIDRRange = (minPrice: number, maxPrice: number): string => {
  const fmt = getCurrencyFormatter();
  if (minPrice === maxPrice) return fmt(minPrice);
  return `${fmt(minPrice)} - ${fmt(maxPrice)}`;
};
