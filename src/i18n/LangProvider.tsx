import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SITE, type Locale } from "@/config/site";
import id from "./id.json";
import en from "./en.json";

const dicts: Record<Locale, Record<string, string>> = { id, en };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "astra.locale";

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return SITE.defaultLocale;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    return stored && SITE.supportedLocales.includes(stored) ? stored : SITE.defaultLocale;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key: string) => dicts[locale][key] ?? dicts[SITE.defaultLocale][key] ?? key,
    }),
    [locale]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside <LangProvider>");
  return ctx;
}
