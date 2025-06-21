
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "id";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Use localStorage if available, fallback to "en"
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      return savedLang === "id" ? "id" : "en";
    }
    return "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  
  const toggleLanguage = () => {
    setLanguageState(current => current === "en" ? "id" : "en");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
