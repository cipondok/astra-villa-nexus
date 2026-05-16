export interface GeoExpansionInput {
  cities: string[];
  traffic_data: Record<string, number>;   // city → monthly visits/sessions
  agent_density: Record<string, number>;  // city → active agent count
}

export interface TargetCity {
  city: string;
  opportunity_score: number;
  reason: string;
}

export interface GeoExpansionResult {
  next_target_cities: TargetCity[];
  market_entry_tactic: string;
  inventory_growth_strategy: string;
}

// Indonesian tier-2/3 cities with high property growth potential
const CANDIDATE_POOL: Record<string, { region: string; base_score: number }> = {
  "Jakarta": { region: "DKI Jakarta", base_score: 95 },
  "Surabaya": { region: "Jawa Timur", base_score: 88 },
  "Bandung": { region: "Jawa Barat", base_score: 85 },
  "Medan": { region: "Sumatera Utara", base_score: 78 },
  "Semarang": { region: "Jawa Tengah", base_score: 80 },
  "Makassar": { region: "Sulawesi Selatan", base_score: 76 },
  "Denpasar": { region: "Bali", base_score: 90 },
  "Yogyakarta": { region: "DIY", base_score: 74 },
  "Balikpapan": { region: "Kalimantan Timur", base_score: 82 },
  "Malang": { region: "Jawa Timur", base_score: 72 },
  "Solo": { region: "Jawa Tengah", base_score: 70 },
  "Manado": { region: "Sulawesi Utara", base_score: 68 },
  "Palembang": { region: "Sumatera Selatan", base_score: 66 },
  "Batam": { region: "Kepulauan Riau", base_score: 73 },
  "Tangerang": { region: "Banten", base_score: 83 },
  "Bekasi": { region: "Jawa Barat", base_score: 81 },
  "Depok": { region: "Jawa Barat", base_score: 77 },
  "Bogor": { region: "Jawa Barat", base_score: 75 },
  "Lombok": { region: "NTB", base_score: 71 },
  "Samarinda": { region: "Kalimantan Timur", base_score: 69 },
};

const normalize = (s: string) => s.trim().toLowerCase();

/**
 * Suggests top 3 geographic expansion cities based on:
 * - Excluding already-active cities
 * - Boosting cities with existing traffic demand (demand signal)
 * - Penalizing cities with high agent density (competition)
 * - Ranking by adjusted opportunity score
 */
export function suggestGeoExpansion(input: GeoExpansionInput): GeoExpansionResult {
  const { cities, traffic_data, agent_density } = input;

  const activeSet = new Set(cities.map(normalize));

  // Normalize traffic & agent maps
  const trafficMap = new Map<string, number>();
  for (const [k, v] of Object.entries(traffic_data)) trafficMap.set(normalize(k), v);

  const agentMap = new Map<string, number>();
  for (const [k, v] of Object.entries(agent_density)) agentMap.set(normalize(k), v);

  // Max values for normalization
  const maxTraffic = Math.max(1, ...trafficMap.values());
  const maxAgents = Math.max(1, ...agentMap.values());

  // Score candidates
  const scored: TargetCity[] = [];

  for (const [city, meta] of Object.entries(CANDIDATE_POOL)) {
    if (activeSet.has(normalize(city))) continue;

    const traffic = trafficMap.get(normalize(city)) ?? 0;
    const agents = agentMap.get(normalize(city)) ?? 0;

    // Demand bonus: traffic signal means users already searching this city
    const demandBonus = (traffic / maxTraffic) * 15;
    // Competition penalty: high agent density = harder entry
    const competitionPenalty = (agents / maxAgents) * 10;

    const score = Math.round(Math.min(100, meta.base_score + demandBonus - competitionPenalty));

    let reason: string;
    if (traffic > 0 && agents === 0) {
      reason = `Permintaan organik tinggi tanpa kompetisi agen — peluang first-mover di ${meta.region}.`;
    } else if (traffic > 0) {
      reason = `Demand signal terdeteksi dengan kompetisi moderat — potensi market share cepat di ${meta.region}.`;
    } else {
      reason = `Fundamental kota kuat (skor basis ${meta.base_score}) di ${meta.region} — pasar belum terjamah.`;
    }

    scored.push({ city, opportunity_score: score, reason });
  }

  scored.sort((a, b) => b.opportunity_score - a.opportunity_score);
  const top3 = scored.slice(0, 3);

  // --- Entry tactic ---
  const hasTrafficCities = top3.filter(c => (trafficMap.get(normalize(c.city)) ?? 0) > 0);
  const market_entry_tactic = hasTrafficCities.length >= 2
    ? "Demand-Led Entry: Prioritaskan kota dengan traffic organik existing — launch dengan landing page lokal, Google Ads geo-targeted, dan partnership agen lokal top-3 untuk akuisisi listing awal 50 properti dalam 30 hari."
    : "Supply-First Entry: Rekrut 5-10 agen lokal terverifikasi sebagai anchor partners, tawarkan listing gratis 3 bulan pertama, dan bangun inventory minimum 30 properti sebelum aktivasi demand campaign.";

  // --- Inventory strategy ---
  const avgAgentDensity = top3.reduce((s, c) => s + (agentMap.get(normalize(c.city)) ?? 0), 0) / 3;
  const inventory_growth_strategy = avgAgentDensity > 5
    ? "Competitive Acquisition: Tawarkan tools premium gratis (AI pricing, virtual tour) untuk menarik agen dari platform kompetitor. Target konversi 20% agen existing dalam 60 hari dengan onboarding concierge."
    : "Greenfield Build: Jalankan program 'Agen Properti Digital' — rekrut freelance agen dan property owner langsung. Sediakan training kit, listing tools, dan komisi early-adopter 2x untuk 100 listing pertama.";

  return { next_target_cities: top3, market_entry_tactic, inventory_growth_strategy };
}
