import React from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCY_META } from "@/stores/currencyStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceProps {
  /** Amount in IDR (base currency) */
  amount: number;
  /** Use compact format (e.g., 1.2B, 850M) */
  short?: boolean;
  /** Show flag + currency code inline (default true) */
  showFlag?: boolean;
  className?: string;
}

const formatIDRStatic = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const Price: React.FC<PriceProps> = ({ amount, short = false, showFlag = true, className }) => {
  const { currency, formatPrice, formatPriceShort } = useCurrency();
  const formatted = short ? formatPriceShort(amount) : formatPrice(amount);
  const meta = CURRENCY_META[currency];

  const content = (
    <span className={`inline-flex items-center gap-1 ${className || ""}`}>
      {showFlag && currency !== "IDR" && (
        <span className="text-[0.85em] leading-none">{meta.flag}</span>
      )}
      <span>{formatted}</span>
    </span>
  );

  if (currency === "IDR") {
    return content;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span style={{ cursor: "default" }}>
            {content}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          ≈ {formatIDRStatic(amount)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Price;
