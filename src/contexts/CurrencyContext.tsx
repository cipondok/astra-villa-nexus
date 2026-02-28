import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { safeLocalStorage } from "@/lib/safeStorage";
import { useCurrencyStore, CURRENCY_META } from "@/stores/currencyStore";

export type CurrencyCode = "IDR" | "USD" | "SGD" | "AUD";

interface ExchangeRates {
  IDR: number;
  USD: number;
  SGD: number;
  AUD: number;
}

interface CurrencyContextProps {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (amountIDR: number) => number;
  formatPrice: (amountIDR: number) => string;
  formatPriceShort: (amountIDR: number) => string;
  rates: ExchangeRates;
}

const DEFAULT_RATES: ExchangeRates = {
  IDR: 1,
  USD: 1 / 16_200,
  SGD: 1 / 11_900,
  AUD: 1 / 10_500,
};

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

/** Map language → default currency */
const LANG_CURRENCY_MAP: Record<string, CurrencyCode> = {
  id: "IDR",
  en: "USD",
  zh: "SGD",
  ja: "USD",
  ko: "USD",
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = safeLocalStorage.getItem("currency");
    if (saved && ["IDR", "USD", "SGD", "AUD"].includes(saved)) return saved as CurrencyCode;
    return "IDR";
  });

  const [rates] = useState<ExchangeRates>(DEFAULT_RATES);

  useEffect(() => {
    safeLocalStorage.setItem("currency", currency);
  }, [currency]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    useCurrencyStore.setState({ currency: c, manuallySet: true });
  };

  const convert = (amountIDR: number): number => amountIDR * rates[currency];

  const formatPrice = (amountIDR: number): string => {
    const converted = convert(amountIDR);
    const config = CURRENCY_META[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);
  };

  const formatPriceShort = (amountIDR: number): string => {
    const converted = convert(amountIDR);
    const config = CURRENCY_META[currency];
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

  // Sync to zustand store
  useEffect(() => {
    useCurrencyStore.setState({ currency, rates });
  }, [currency, rates]);

  // Listen for language changes and auto-switch currency if not manually set
  useEffect(() => {
    const handleStorage = () => {
      const lang = safeLocalStorage.getItem("language") || "en";
      const { manuallySet } = useCurrencyStore.getState();
      if (!manuallySet && LANG_CURRENCY_MAP[lang]) {
        setCurrencyState(LANG_CURRENCY_MAP[lang]);
      }
    };
    window.addEventListener("storage", handleStorage);
    // Also check on mount
    handleStorage();
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, formatPrice, formatPriceShort, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};
