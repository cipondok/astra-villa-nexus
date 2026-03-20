import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";
import { CURRENCY_META } from "@/stores/currencyStore";
import { ChevronDown, Check } from "lucide-react";
import type { Language } from "@/i18n/translations";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "id", label: "ID", flag: "🇮🇩" },
  { code: "zh", label: "ZH", flag: "🇨🇳" },
  { code: "ja", label: "JA", flag: "🇯🇵" },
  { code: "ko", label: "KO", flag: "🇰🇷" },
];

const CURRENCIES = (Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => ({
  code,
  ...CURRENCY_META[code],
}));

interface LocaleSelectorProps {
  className?: string;
}

const LocaleSelector: React.FC<LocaleSelectorProps> = ({ className = "" }) => {
  const { language, setLanguage } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const currentCur = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Select language and currency"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <span className="text-muted-foreground">·</span>
        <span>{currentCur.symbol}</span>
        <ChevronDown className={`h-2.5 w-2.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full z-[10002] mb-1 w-[200px] overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95 lg:bottom-auto lg:top-full lg:mb-0 lg:mt-1"
          role="dialog"
          aria-label="Language and currency options"
        >
          {/* Language Section */}
          <div className="mb-1.5">
            <div className="px-1 pb-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Language</div>
            <div className="grid grid-cols-3 gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`flex items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-medium transition-all
                    ${language === lang.code
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "text-foreground hover:bg-muted"
                    }`}
                  onClick={() => setLanguage(lang.code)}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 my-1.5" />

          {/* Currency Section */}
          <div>
            <div className="px-1 pb-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Currency</div>
            <div className="grid grid-cols-2 gap-1">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all
                    ${currency === cur.code
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "text-foreground hover:bg-muted"
                    }`}
                  onClick={() => {
                    setCurrency(cur.code);
                  }}
                >
                  <span className="text-sm">{cur.flag}</span>
                  <span className="flex-1 text-left">{cur.code}</span>
                  <span className="text-[10px] text-muted-foreground">{cur.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocaleSelector;
