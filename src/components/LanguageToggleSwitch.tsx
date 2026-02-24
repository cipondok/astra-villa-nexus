
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { ChevronDown, Check, Globe } from "lucide-react";
import type { Language } from "@/i18n/translations";

interface LanguageToggleSwitchProps {
  className?: string;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "id", label: "Bahasa", flag: "🇮🇩" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

const LanguageToggleSwitch: React.FC<LanguageToggleSwitchProps> = ({ className = "" }) => {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full z-[10002] mb-1 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in-0 zoom-in-95 lg:bottom-auto lg:top-full lg:mb-0 lg:mt-1"
          role="listbox"
          aria-label="Language options"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={language === lang.code}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors
                ${language === lang.code ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {language === lang.code && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggleSwitch;
