import React, { useState, useRef, useEffect } from "react";
import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";
import { CURRENCY_META } from "@/stores/currencyStore";
import { ChevronDown, Check, Coins } from "lucide-react";

interface CurrencySelectorProps {
  className?: string;
}

const CURRENCIES = (Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => ({
  code,
  ...CURRENCY_META[code],
}));

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = "" }) => {
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

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Select currency"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Coins className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full z-[10002] mb-1 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl animate-in fade-in-0 zoom-in-95 lg:bottom-auto lg:top-full lg:mb-0 lg:mt-1"
          role="listbox"
          aria-label="Currency options"
        >
          {CURRENCIES.map((cur) => (
            <button
              key={cur.code}
              role="option"
              aria-selected={currency === cur.code}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors
                ${currency === cur.code ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
              onClick={() => {
                setCurrency(cur.code);
                setOpen(false);
              }}
            >
              <span className="text-base">{cur.flag}</span>
              <span className="flex-1 text-left font-medium">{cur.code}</span>
              <span className="text-xs text-muted-foreground">{cur.symbol}</span>
              {currency === cur.code && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
