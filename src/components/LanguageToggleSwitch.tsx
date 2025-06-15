
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleSwitchProps {
  className?: string;
}

const LanguageToggleSwitch: React.FC<LanguageToggleSwitchProps> = ({ className = "" }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={
        `flex items-center rounded-full border border-gray-300 bg-gray-100 dark:bg-gray-800 px-1 py-1 w-20 h-9 relative cursor-pointer transition-colors duration-200
        ${className}`
      }
      role="button"
      aria-label="Toggle language"
      tabIndex={0}
      onClick={() => setLanguage(language === "en" ? "id" : "en")}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          setLanguage(language === "en" ? "id" : "en");
        }
      }}
    >
      {/* Sliding background */}
      <span
        className={`absolute left-1 top-1 bottom-1 w-8 rounded-full bg-white shadow transition-transform duration-300
        ${language === "en" ? "translate-x-0" : "translate-x-8"}`}
        aria-hidden="true"
      />
      {/* EN Label */}
      <span
        className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors duration-300 ${
          language === "en" ? "text-primary" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        EN
      </span>
      {/* ID Label */}
      <span
        className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors duration-300 ${
          language === "id" ? "text-primary" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        ID
      </span>
    </div>
  );
};

export default LanguageToggleSwitch;
