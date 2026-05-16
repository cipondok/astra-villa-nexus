/**
 * Indonesian locale formatting utilities
 * Default locale: id-ID, timezone: Asia/Jakarta
 */

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

/**
 * Format date to Indonesian format: "DD MMMM YYYY"
 * Example: "12 Januari 2026"
 */
export function formatDateID(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = INDONESIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date with day name: "Senin, 12 Januari 2026"
 */
export function formatDateLongID(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const dayName = INDONESIAN_DAYS[d.getDay()];
  return `${dayName}, ${formatDateID(d)}`;
}

/**
 * Format date short: "12 Jan 2026"
 */
export function formatDateShortID(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = INDONESIAN_MONTHS[d.getMonth()].slice(0, 3);
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format number with Indonesian separators (dot for thousands, comma for decimals)
 * Example: 3500000000 → "3.500.000.000"
 */
export function formatNumberID(value: number, decimals = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency IDR: "Rp 3.500.000.000"
 */
export function formatCurrencyIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency IDR short: "Rp 3,5M" or "Rp 500Jt"
 */
export function formatCurrencyIDRShort(value: number): string {
  if (value >= 1_000_000_000_000) return `Rp ${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}Jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}Rb`;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

/**
 * Format relative time in Indonesian
 */
export function formatRelativeTimeID(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}
