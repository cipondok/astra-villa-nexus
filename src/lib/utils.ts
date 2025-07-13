import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `IDR ${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `IDR ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `IDR ${(amount / 1000).toFixed(0)}K`;
  } else {
    return `IDR ${amount.toLocaleString()}`;
  }
}
