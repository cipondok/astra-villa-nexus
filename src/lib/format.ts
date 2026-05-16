// Formatting helpers — IDR base, id-ID locale.
export function formatIDR(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "Rp 0";
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1)} M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)} Jt`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function formatIDRFull(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}
