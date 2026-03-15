export type InvestorDemand = "low" | "moderate" | "high" | "very_high";

export interface FractionalModelInput {
  property_value: number;    // IDR
  investor_demand: InvestorDemand;
  yield_pct: number;         // annual rental yield %
}

export interface FractionalModelResult {
  fractional_structure: string;
  suggested_ticket_size: string;
  liquidity_model: string;
  innovation_summary: string;
  total_tokens: number;
  token_price: number;
  projected_annual_return_per_token: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const DEMAND_CONFIG: Record<InvestorDemand, { divisor: number; label: string }> = {
  very_high: { divisor: 1_000_000, label: "Micro-Fractional (ultra-accessible)" },
  high:      { divisor: 5_000_000, label: "Nano-Fractional (mass-market)" },
  moderate:  { divisor: 10_000_000, label: "Standard Fractional (retail investor)" },
  low:       { divisor: 25_000_000, label: "Premium Fractional (qualified investor)" },
};

/**
 * Generates a conceptual fractional property investment model.
 *
 * Token count = property_value / ticket_size (based on demand tier).
 * Liquidity model adapts to token volume and yield.
 * All text in Indonesian.
 */
export function generateFractionalModel(input: FractionalModelInput): FractionalModelResult {
  const { property_value, investor_demand, yield_pct } = input;

  const config = DEMAND_CONFIG[investor_demand] ?? DEMAND_CONFIG.moderate;
  const tokenPrice = config.divisor;
  const totalTokens = Math.max(1, Math.round(property_value / tokenPrice));
  const annualReturnPerToken = Math.round(tokenPrice * (yield_pct / 100));

  // --- Structure ---
  const fractional_structure =
    `${config.label}: Properti senilai ${fmt(property_value)} dibagi menjadi ${totalTokens.toLocaleString("id-ID")} token digital, masing-masing bernilai ${fmt(tokenPrice)}. Setiap token merepresentasikan kepemilikan proporsional atas aset dan hak atas distribusi pendapatan sewa.`;

  // --- Ticket size ---
  const suggested_ticket_size =
    `Minimum investasi: ${fmt(tokenPrice)} per token. Investor dapat membeli kelipatan sesuai kapasitas — mulai dari 1 token hingga maksimum 20% total supply (${Math.floor(totalTokens * 0.2)} token) untuk menjaga diversifikasi kepemilikan.`;

  // --- Liquidity model ---
  let liquidity_model: string;
  if (totalTokens >= 100 && yield_pct >= 5) {
    liquidity_model =
      "Secondary Market Model: Token dapat diperdagangkan di marketplace internal dengan mekanisme order book. Likuiditas didukung oleh volume token tinggi dan yield menarik — estimasi settlement T+1 dengan escrow otomatis.";
  } else if (totalTokens >= 50) {
    liquidity_model =
      "Buyback Pool Model: Platform menyediakan buyback pool kuartalan menggunakan 10% pendapatan sewa terkumpul. Investor dapat mengajukan redemption setiap kuartal dengan harga NAV terkini.";
  } else {
    liquidity_model =
      "Peer-to-Peer Transfer Model: Token dapat ditransfer antar investor terdaftar dengan persetujuan platform. Exit window tersedia setiap 6 bulan melalui mekanisme Dutch auction internal.";
  }

  // --- Innovation summary ---
  const yieldLabel = yield_pct >= 7 ? "premium" : yield_pct >= 5 ? "kompetitif" : "stabil";
  const innovation_summary =
    `Model fraksinasi ini mendemokratisasi akses ke properti senilai ${fmt(property_value)} dengan entry point ${fmt(tokenPrice)}. Dengan projected yield ${yield_pct}% (${yieldLabel}), setiap token menghasilkan estimasi ${fmt(annualReturnPerToken)}/tahun. Struktur ini memungkinkan diversifikasi portofolio properti tanpa beban kepemilikan penuh, didukung smart contract untuk transparansi distribusi dan governance.`;

  return {
    fractional_structure,
    suggested_ticket_size,
    liquidity_model,
    innovation_summary,
    total_tokens: totalTokens,
    token_price: tokenPrice,
    projected_annual_return_per_token: annualReturnPerToken,
  };
}
