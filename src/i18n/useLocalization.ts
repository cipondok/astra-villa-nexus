import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from './translations';

/**
 * Smart localization layer for currency, date, and number formatting.
 * Auto-selects locale settings based on active language.
 */

const LOCALE_MAP: Record<Language, string> = {
  id: 'id-ID',
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ru: 'ru-RU',
};

const DEFAULT_CURRENCY_MAP: Record<Language, string> = {
  id: 'IDR',
  en: 'USD',
  zh: 'CNY',
  ja: 'JPY',
  ko: 'KRW',
  ru: 'RUB',
};

export const useLocalization = () => {
  const { language } = useLanguage();
  const locale = LOCALE_MAP[language] || 'id-ID';

  /** Format currency — defaults to IDR for Indonesian context */
  const formatCurrency = useCallback(
    (amount: number, currency: string = 'IDR', options?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: currency === 'IDR' || currency === 'JPY' || currency === 'KRW' ? 0 : 2,
          maximumFractionDigits: currency === 'IDR' || currency === 'JPY' || currency === 'KRW' ? 0 : 2,
          ...options,
        }).format(amount);
      } catch {
        return `${currency} ${amount.toLocaleString(locale)}`;
      }
    },
    [locale]
  );

  /** Format number with locale-aware separators */
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(num);
    },
    [locale]
  );

  /** Format percentage */
  const formatPercent = useCallback(
    (value: number, decimals: number = 1) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
    },
    [locale]
  );

  /** Format date with locale awareness */
  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      }).format(d);
    },
    [locale]
  );

  /** Format relative time (e.g., "2 days ago") */
  const formatRelativeTime = useCallback(
    (date: Date | string | number) => {
      const d = date instanceof Date ? date : new Date(date);
      const diff = Date.now() - d.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        if (days > 0) return rtf.format(-days, 'day');
        if (hours > 0) return rtf.format(-hours, 'hour');
        if (minutes > 0) return rtf.format(-minutes, 'minute');
        return rtf.format(-seconds, 'second');
      } catch {
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
      }
    },
    [locale]
  );

  /** Format compact number (e.g., 1.2M, 500K) */
  const formatCompact = useCallback(
    (num: number) => {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }).format(num);
    },
    [locale]
  );

  const defaultCurrency = DEFAULT_CURRENCY_MAP[language] || 'IDR';

  return {
    locale,
    language,
    defaultCurrency,
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDate,
    formatRelativeTime,
    formatCompact,
  };
};

export default useLocalization;
