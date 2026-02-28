import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { safeLocalStorage } from "@/lib/safeStorage";
import { useCurrencyStore } from "@/stores/currencyStore";

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
  /** Convert an IDR amount to the selected currency */
  convert: (amountIDR: number) => number;
  /** Format an IDR amount in the selected currency */
  formatPrice: (amountIDR: number) => string;
  /** Short format for compact display (e.g., 1.2B, 850M) */
  formatPriceShort: (amountIDR: number) => string;
  rates: ExchangeRates;
}

// Approximate exchange rates (IDR base) — updated periodically
const DEFAULT_RATES: ExchangeRates = {
  IDR: 1,
  USD: 1 / 16_200,
  SGD: 1 / 11_900,
  AUD: 1 / 10_500,
};

const CURRENCY_CONFIG: Record<CurrencyCode, { locale: string; symbol: string; decimals: number }> = {
  IDR: { locale: "id-ID", symbol: "Rp", decimals: 0 },
  USD: { locale: "en-US", symbol: "$", decimals: 0 },
  SGD: { locale: "en-SG", symbol: "S$", decimals: 0 },
  AUD: { locale: "en-AU", symbol: "A$", decimals: 0 },
};

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

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

  const setCurrency = (c: CurrencyCode) => setCurrencyState(c);

  const convert = (amountIDR: number): number => {
    return amountIDR * rates[currency];
  };

  const formatPrice = (amountIDR: number): string => {
    const converted = convert(amountIDR);
    const config = CURRENCY_CONFIG[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);
  };

  const formatPriceShort = (amountIDR: number): string => {
    const converted = convert(amountIDR);
    const config = CURRENCY_CONFIG[currency];
    
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

  // Sync to zustand store for non-React contexts
  const syncStore = useCurrencyStore.getState();
  useEffect(() => {
    useCurrencyStore.setState({ currency, rates });
  }, [currency, rates]);

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
