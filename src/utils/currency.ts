
/**
 * Formats a number as Indonesian Rupiah (IDR) currency
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'id-ID')
 * @returns Formatted currency string
 */
export const formatIDR = (amount: number, locale: string = 'id-ID'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number as plain IDR without currency symbol
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'id-ID')
 * @returns Formatted number string
 */
export const formatIDRPlain = (amount: number, locale: string = 'id-ID'): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Converts USD to IDR (approximate conversion rate)
 * @param usdAmount - Amount in USD
 * @param exchangeRate - Exchange rate (default: 15800)
 * @returns Amount in IDR
 */
export const convertUSDToIDR = (usdAmount: number, exchangeRate: number = 15800): number => {
  return usdAmount * exchangeRate;
};

/**
 * Parses IDR string back to number
 * @param idrString - IDR formatted string
 * @returns Parsed number
 */
export const parseIDR = (idrString: string): number => {
  return parseInt(idrString.replace(/[^\d]/g, '')) || 0;
};

/**
 * Format price range for IDR
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export const formatIDRRange = (minPrice: number, maxPrice: number): string => {
  if (minPrice === maxPrice) {
    return formatIDR(minPrice);
  }
  return `${formatIDR(minPrice)} - ${formatIDR(maxPrice)}`;
};
