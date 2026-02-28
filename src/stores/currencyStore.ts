import { create } from "zustand";
import type { CurrencyCode } from "@/contexts/CurrencyContext";

interface ExchangeRates {
  IDR: number;
  USD: number;
  SGD: number;
  AUD: number;
}

const DEFAULT_RATES: ExchangeRates = {
  IDR: 1,
  USD: 1 / 16_200,
  SGD: 1 / 11_900,
  AUD: 1 / 10_500,
};

export const CURRENCY_META: Record<CurrencyCode, { locale: string; symbol: string; decimals: number; flag: string; label: string }> = {
  IDR: { locale: "id-ID", symbol: "Rp", decimals: 0, flag: "🇮🇩", label: "IDR" },
  USD: { locale: "en-US", symbol: "$", decimals: 0, flag: "🇺🇸", label: "USD" },
  SGD: { locale: "en-SG", symbol: "S$", decimals: 0, flag: "🇸🇬", label: "SGD" },
  AUD: { locale: "en-AU", symbol: "A$", decimals: 0, flag: "🇦🇺", label: "AUD" },
};

interface CurrencyStore {
  currency: CurrencyCode;
  rates: ExchangeRates;
  manuallySet: boolean;
  setCurrency: (c: CurrencyCode, manual?: boolean) => void;
  setRates: (r: ExchangeRates) => void;
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currency: "IDR",
  rates: DEFAULT_RATES,
  manuallySet: false,
  setCurrency: (currency, manual = false) => set({ currency, manuallySet: manual || undefined }),
  setRates: (rates) => set({ rates }),
}));

/** Plain function for non-React contexts (chart tooltips, PDF generators, etc.) */
export const getCurrencyFormatter = () => {
  const { currency, rates } = useCurrencyStore.getState();
  const config = CURRENCY_META[currency];

  return (amountIDR: number): string => {
    const converted = amountIDR * rates[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);
  };
};

/** Short formatter for chart axes etc. */
export const getCurrencyFormatterShort = () => {
  const { currency, rates } = useCurrencyStore.getState();
  const config = CURRENCY_META[currency];

  return (amountIDR: number): string => {
    const converted = amountIDR * rates[currency];
    let value: string;
    if (currency === "IDR") {
      if (converted >= 1_000_000_000) value = `${(converted / 1_000_000_000).toFixed(1)}B`;
      else if (converted >= 1_000_000) value = `${(converted / 1_000_000).toFixed(0)}M`;
      else value = converted.toLocaleString(config.locale);
    } else {
      if (converted >= 1_000_000) value = `${(converted / 1_000_000).toFixed(1)}M`;
      else if (converted >= 1_000) value = `${(converted / 1_000).toFixed(0)}K`;
      else value = converted.toFixed(config.decimals);
    }
    return `${config.symbol} ${value}`;
  };
};
