import React from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceProps {
  /** Amount in IDR (base currency) */
  amount: number;
  /** Use compact format (e.g., 1.2B, 850M) */
  short?: boolean;
  className?: string;
}

const formatIDRStatic = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const Price: React.FC<PriceProps> = ({ amount, short = false, className }) => {
  const { currency, formatPrice, formatPriceShort } = useCurrency();
  const formatted = short ? formatPriceShort(amount) : formatPrice(amount);

  if (currency === "IDR") {
    return <span className={className}>{formatted}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className} style={{ cursor: "default" }}>
          {formatted}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        ≈ {formatIDRStatic(amount)}
      </TooltipContent>
    </Tooltip>
  );
};

export default Price;
