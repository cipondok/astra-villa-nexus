
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "id" | "zh" | "ja" | "ko";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Use localStorage if available, fallback to "en"
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      const validLangs: Language[] = ["en", "id", "zh", "ja", "ko"];
      return validLangs.includes(savedLang as Language) ? (savedLang as Language) : "en";
    }
    return "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
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
