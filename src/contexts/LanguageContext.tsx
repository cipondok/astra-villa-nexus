
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { safeLocalStorage } from "@/lib/safeStorage";

type Language = "en" | "id" | "zh" | "ja" | "ko";

const VALID_LANGS: Language[] = ["en", "id", "zh", "ja", "ko"];

const detectBrowserLanguage = (): Language => {
  try {
    const langs = navigator.languages ?? [navigator.language];
    for (const locale of langs) {
      const prefix = locale.split("-")[0].toLowerCase();
      if (prefix === "zh") return "zh";
      if (prefix === "ja") return "ja";
      if (prefix === "ko") return "ko";
      if (prefix === "id" || prefix === "ms") return "id";
      if (prefix === "en") return "en";
    }
  } catch {
    // navigator may not be available
  }
  return "en";
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeLocalStorage.getItem("language");
    if (saved && VALID_LANGS.includes(saved as Language)) return saved as Language;
    return detectBrowserLanguage();
  });

  useEffect(() => {
    safeLocalStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
