export type GrowthLevel = "LOW" | "MODERATE" | "HIGH" | "FUTURE HOTSPOT";

export interface InvestmentTimingResult {
  investment_entry_timing: "TOO EARLY" | "EARLY OPPORTUNITY" | "GROWTH PHASE" | "MATURE MARKET";
  speculative_risk_level: "LOW" | "MEDIUM" | "HIGH";
  opportunity_summary: string;
}

/**
 * Determine investment entry timing based on growth score and growth level.
 * Pure client-side logic — no API call needed.
 */
export function classifyInvestmentTiming(
  growthScore: number,
  growthLevel: GrowthLevel,
  hasInfraSignals: boolean = false
): InvestmentTimingResult {
  // FUTURE HOTSPOT with high score — prime early opportunity
  if (growthLevel === "FUTURE HOTSPOT" && growthScore >= 75) {
    return {
      investment_entry_timing: "EARLY OPPORTUNITY",
      speculative_risk_level: hasInfraSignals ? "MEDIUM" : "HIGH",
      opportunity_summary: "Zona potensi tinggi dengan sinyal pertumbuhan kuat. Waktu ideal untuk masuk sebelum harga naik signifikan. Risiko spekulatif terkendali jika infrastruktur sudah dalam tahap pembangunan.",
    };
  }

  // FUTURE HOTSPOT with lower score — too early, high speculation
  if (growthLevel === "FUTURE HOTSPOT" && growthScore < 75) {
    return {
      investment_entry_timing: "TOO EARLY",
      speculative_risk_level: "HIGH",
      opportunity_summary: "Area menunjukkan potensi jangka panjang namun masih terlalu dini untuk investasi. Infrastruktur belum terkonfirmasi dan risiko spekulatif tinggi. Pantau perkembangan 1-2 tahun ke depan.",
    };
  }

  // HIGH growth — active growth phase
  if (growthLevel === "HIGH" && growthScore >= 70) {
    return {
      investment_entry_timing: "GROWTH PHASE",
      speculative_risk_level: "LOW",
      opportunity_summary: "Area sedang dalam fase pertumbuhan aktif dengan fundamental kuat. Harga mulai naik tapi masih ada ruang apresiasi. Risiko rendah karena demand sudah terbukti.",
    };
  }

  if (growthLevel === "HIGH" && growthScore < 70) {
    return {
      investment_entry_timing: "EARLY OPPORTUNITY",
      speculative_risk_level: "MEDIUM",
      opportunity_summary: "Pertumbuhan tinggi namun belum sepenuhnya terealisasi. Peluang masuk lebih awal dengan potensi return yang menarik, namun perlu kehati-hatian terhadap timing.",
    };
  }

  // MODERATE — depends on score
  if (growthLevel === "MODERATE" && growthScore >= 60) {
    return {
      investment_entry_timing: "GROWTH PHASE",
      speculative_risk_level: "LOW",
      opportunity_summary: "Pasar stabil dengan pertumbuhan moderat. Cocok untuk investor konservatif yang mencari apresiasi jangka menengah dengan risiko terkendali.",
    };
  }

  if (growthLevel === "MODERATE" && growthScore >= 40) {
    return {
      investment_entry_timing: "MATURE MARKET",
      speculative_risk_level: "LOW",
      opportunity_summary: "Pasar sudah mapan dengan pertumbuhan lambat namun stabil. Ideal untuk investasi rental yield daripada capital gain. Risiko rendah tapi upside terbatas.",
    };
  }

  if (growthLevel === "MODERATE") {
    return {
      investment_entry_timing: "MATURE MARKET",
      speculative_risk_level: "MEDIUM",
      opportunity_summary: "Area dengan pertumbuhan terbatas. Pertimbangkan kembali apakah lokasi ini sesuai dengan strategi investasi Anda.",
    };
  }

  // LOW growth
  if (growthScore >= 40) {
    return {
      investment_entry_timing: "MATURE MARKET",
      speculative_risk_level: "MEDIUM",
      opportunity_summary: "Pasar sudah jenuh dengan pertumbuhan minimal. Fokus pada rental yield jika tetap ingin berinvestasi di area ini.",
    };
  }

  return {
    investment_entry_timing: "TOO EARLY",
    speculative_risk_level: "HIGH",
    opportunity_summary: "Area belum menunjukkan sinyal pertumbuhan yang memadai. Risiko tinggi tanpa katalis pertumbuhan yang jelas. Tidak direkomendasikan untuk investasi saat ini.",
  };
}
