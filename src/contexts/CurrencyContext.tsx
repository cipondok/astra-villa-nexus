import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { safeLocalStorage } from "@/lib/safeStorage";
import { useCurrencyStore, CURRENCY_META } from "@/stores/currencyStore";
import { supabase } from "@/integrations/supabase/client";

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
  ratesSource: string;
  ratesLoading: boolean;
}

const DEFAULT_RATES: ExchangeRates = {
  IDR: 1,
  USD: 1 / 16_200,
  SGD: 1 / 11_900,
  AUD: 1 / 10_500,
};

const RATES_CACHE_KEY = "exchange_rates_cache";
const RATES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

  const [rates, setRates] = useState<ExchangeRates>(() => {
    // Try loading cached rates from localStorage
    try {
      const cached = safeLocalStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.fetchedAt && Date.now() - parsed.fetchedAt < RATES_CACHE_TTL) {
          return parsed.rates as ExchangeRates;
        }
      }
    } catch {}
    return DEFAULT_RATES;
  });

  const [ratesSource, setRatesSource] = useState<string>("default");
  const [ratesLoading, setRatesLoading] = useState(false);

  // Fetch live exchange rates
  const fetchLiveRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("exchange-rates");

      if (error) {
        console.warn("Exchange rate fetch error:", error);
        return;
      }

      if (data?.rates) {
        const liveRates: ExchangeRates = {
          IDR: data.rates.IDR ?? 1,
          USD: data.rates.USD ?? DEFAULT_RATES.USD,
          SGD: data.rates.SGD ?? DEFAULT_RATES.SGD,
          AUD: data.rates.AUD ?? DEFAULT_RATES.AUD,
        };
        setRates(liveRates);
        setRatesSource(data.fallback ? "fallback" : data.cached ? "cached" : "live");

        // Cache in localStorage
        safeLocalStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
          rates: liveRates,
          fetchedAt: Date.now(),
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch live rates, using defaults:", err);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  // Fetch rates on mount & every hour
  useEffect(() => {
    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, RATES_CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchLiveRates]);

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
    handleStorage();
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, formatPrice, formatPriceShort, rates, ratesSource, ratesLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};
