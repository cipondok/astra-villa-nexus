import { indonesiaProvinces } from "@/data/indonesiaProvinces";

/** Popular Indonesian cities/areas offered alongside the 34 provinces. Visitors can still type any place. */
export const POPULAR_CITY_SUGGESTIONS = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan",
  "Denpasar", "Ubud", "Canggu", "Seminyak", "Kuta", "Uluwatu", "Nusa Dua",
  "Batam", "Makassar", "Balikpapan", "Manado", "Palembang", "Lombok",
];

/** Location suggestions shared by the homepage search and the listings page. */
export const LOCATION_SUGGESTIONS: string[] = Array.from(
  new Set([...indonesiaProvinces.map((p) => p.name), ...POPULAR_CITY_SUGGESTIONS]),
).sort((a, b) => a.localeCompare(b));

/** Case/accent-insensitive prefix-first matching for the location autocomplete. */
export function matchLocations(query: string, list: string[] = LOCATION_SUGGESTIONS, limit = 8): string[] {
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const q = norm(query);
  if (!q) return POPULAR_CITY_SUGGESTIONS.slice(0, limit);
  const starts: string[] = [];
  const contains: string[] = [];
  for (const name of list) {
    const n = norm(name);
    if (n.startsWith(q)) starts.push(name);
    else if (n.includes(q)) contains.push(name);
  }
  return [...starts, ...contains].slice(0, limit);
}
