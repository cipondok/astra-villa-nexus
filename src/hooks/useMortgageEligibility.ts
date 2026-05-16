export type JobStatus = "permanent" | "contract" | "freelance" | "business_owner";

export interface MortgageEligibilityInput {
  income: number;          // monthly income IDR
  debt: number;            // existing monthly debt IDR
  price: number;           // property price IDR
  dp: number;              // down payment available IDR
  job_status: JobStatus;
}

export type EligibilityLevel =
  | "SANGAT LAYAK"
  | "LAYAK"
  | "MARGINAL"
  | "BELUM LAYAK";

export interface MortgageEligibilityResult {
  mortgage_eligibility: EligibilityLevel;
  affordable_price_range: string;
  risk_factor: string;
  recommended_financing_action: string;
  composite_score: number;
  dsr_pct: number;
  dp_pct: number;
}

const JOB_MULTIPLIER: Record<JobStatus, number> = {
  permanent: 1.0,
  business_owner: 0.85,
  contract: 0.7,
  freelance: 0.55,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

/**
 * Evaluates mortgage feasibility using Indonesian banking norms.
 *
 * DSR (Debt Service Ratio) threshold: 30-40% of income for total obligations.
 * DP minimum: typically 10-20% for subsidised / conventional KPR.
 * Employment stability affects max approved multiplier.
 *
 * Composite = dsr_health * 0.35 + dp_health * 0.30 + job_factor * 0.20 + ltv_health * 0.15
 *
 * 76-100 → SANGAT LAYAK
 * 56-75  → LAYAK
 * 36-55  → MARGINAL
 * 0-35   → BELUM LAYAK
 */
export function evaluateMortgageEligibility(input: MortgageEligibilityInput): MortgageEligibilityResult {
  const { income, debt, price, dp, job_status } = input;

  // --- DSR analysis (lower is better) ---
  const loanAmount = Math.max(0, price - dp);
  // Approx monthly instalment: 20-year tenor, ~8% annual → factor ≈ 0.00836
  const estimatedInstalment = loanAmount * 0.00836;
  const totalObligation = debt + estimatedInstalment;
  const dsrPct = income > 0 ? (totalObligation / income) * 100 : 100;
  const dsrHealth = dsrPct <= 30 ? 100 : dsrPct <= 40 ? 70 : dsrPct <= 55 ? 40 : Math.max(0, 100 - dsrPct);

  // --- DP analysis ---
  const dpPct = price > 0 ? (dp / price) * 100 : 0;
  const dpHealth = dpPct >= 30 ? 100 : dpPct >= 20 ? 80 : dpPct >= 10 ? 55 : Math.max(0, dpPct * 4);

  // --- Job stability ---
  const jobFactor = (JOB_MULTIPLIER[job_status] ?? 0.7) * 100;

  // --- LTV health (lower LTV = better) ---
  const ltvPct = price > 0 ? (loanAmount / price) * 100 : 100;
  const ltvHealth = ltvPct <= 70 ? 100 : ltvPct <= 80 ? 75 : ltvPct <= 90 ? 45 : Math.max(0, 100 - ltvPct);

  const composite = Math.round(
    dsrHealth * 0.35 + dpHealth * 0.30 + jobFactor * 0.20 + ltvHealth * 0.15
  );

  // --- Affordable range (max instalment = 35% income minus existing debt) ---
  const maxInstalment = Math.max(0, income * 0.35 - debt);
  const maxLoan = maxInstalment / 0.00836;
  const maxPrice = maxLoan + dp;
  const safeMin = Math.round(maxPrice * 0.7);
  const safeMax = Math.round(maxPrice);

  // --- Classification ---
  let mortgage_eligibility: EligibilityLevel;
  let risk_factor: string;
  let recommended_financing_action: string;

  if (composite >= 76) {
    mortgage_eligibility = "SANGAT LAYAK";
    risk_factor = "Risiko rendah — rasio utang dan DP dalam batas aman untuk persetujuan KPR.";
    recommended_financing_action =
      "Ajukan KPR ke bank utama (BCA/Mandiri/BTN) dengan tenor 15-20 tahun untuk cicilan optimal. Negosiasikan suku bunga fixed 3 tahun pertama.";
  } else if (composite >= 56) {
    mortgage_eligibility = "LAYAK";
    risk_factor = "Risiko moderat — DSR mendekati batas atas, pastikan tidak ada tambahan utang baru.";
    recommended_financing_action =
      "Ajukan KPR dengan DP minimal 20%. Pertimbangkan KPR subsidi (FLPP) jika memenuhi syarat, atau pilih tenor lebih panjang untuk menekan cicilan.";
  } else if (composite >= 36) {
    mortgage_eligibility = "MARGINAL";
    risk_factor = dpPct < 15
      ? "DP terlalu rendah — bank akan mengenakan bunga lebih tinggi atau menolak pengajuan."
      : "Beban utang existing terlalu tinggi — DSR melebihi ambang batas nyaman bank.";
    recommended_financing_action =
      "Tunda pembelian 6-12 bulan. Fokus pada: (1) menambah DP hingga minimal 20%, (2) melunasi utang existing, (3) meningkatkan income stream.";
  } else {
    mortgage_eligibility = "BELUM LAYAK";
    risk_factor = "Profil keuangan belum memenuhi syarat minimum KPR — kombinasi DSR tinggi, DP rendah, atau stabilitas pekerjaan kurang.";
    recommended_financing_action =
      "Bangun fondasi keuangan terlebih dahulu: target tabungan DP 30%, lunasi utang konsumtif, dan pertimbangkan properti di range harga yang lebih rendah.";
  }

  return {
    mortgage_eligibility,
    affordable_price_range: `${fmt(safeMin)} – ${fmt(safeMax)}`,
    risk_factor,
    recommended_financing_action,
    composite_score: composite,
    dsr_pct: Math.round(dsrPct * 10) / 10,
    dp_pct: Math.round(dpPct * 10) / 10,
  };
}
