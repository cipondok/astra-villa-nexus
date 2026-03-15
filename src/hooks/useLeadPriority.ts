export interface LeadPriorityInput {
  buyer_intent_score: number;
  budget_level: string; // e.g. "clear", "vague", "none"
  visit_plan: string;   // e.g. "yes", "maybe", "no"
  timeframe: string;    // e.g. "this_week", "this_month", "no_timeline"
}

export interface LeadPriorityResult {
  lead_priority: "PRIORITY 1" | "PRIORITY 2" | "PRIORITY 3";
  follow_up_strategy: string;
  urgency_color: "hot" | "warm" | "cold";
}

export function classifyLeadPriority(input: LeadPriorityInput): LeadPriorityResult {
  const { buyer_intent_score, budget_level, visit_plan, timeframe } = input;

  const hasClearBudget = budget_level === "clear";
  const hasVisitPlan = visit_plan === "yes";
  const isUrgentTimeline = timeframe === "this_week";
  const isMediumTimeline = timeframe === "this_month";

  // PRIORITY 1: HOT intent + clear budget + visit plan
  if (buyer_intent_score >= 76 && hasClearBudget && hasVisitPlan) {
    return {
      lead_priority: "PRIORITY 1",
      urgency_color: "hot",
      follow_up_strategy: isUrgentTimeline
        ? "Hubungi dalam 15 menit. Siapkan 2-3 opsi properti sesuai budget. Konfirmasi jadwal survey segera dan kirim detail unit via WhatsApp."
        : "Hubungi dalam 1 jam. Kirim shortlist properti yang sesuai budget dan lokasi. Tawarkan jadwal survey dalam 3 hari ke depan.",
    };
  }

  // PRIORITY 1 edge case: Very high score with at least one strong signal
  if (buyer_intent_score >= 85 && (hasClearBudget || hasVisitPlan)) {
    return {
      lead_priority: "PRIORITY 1",
      urgency_color: "hot",
      follow_up_strategy: "Lead sangat serius. Hubungi dalam 30 menit untuk klarifikasi kebutuhan. Siapkan rekomendasi properti dan jadwal kunjungan.",
    };
  }

  // PRIORITY 2: Medium signals
  if (
    (buyer_intent_score >= 51 && buyer_intent_score < 76) ||
    (buyer_intent_score >= 76 && !hasClearBudget && !hasVisitPlan) ||
    (hasClearBudget && isMediumTimeline)
  ) {
    return {
      lead_priority: "PRIORITY 2",
      urgency_color: "warm",
      follow_up_strategy: hasClearBudget
        ? "Follow up dalam 24 jam. Kirim katalog properti sesuai budget. Tanyakan preferensi lokasi dan tipe untuk menyaring pilihan."
        : "Follow up dalam 24-48 jam. Bantu klarifikasi budget dan kebutuhan. Kirim 3-5 opsi properti untuk memancing respon lebih lanjut.",
    };
  }

  // PRIORITY 3: Low signals
  return {
    lead_priority: "PRIORITY 3",
    urgency_color: "cold",
    follow_up_strategy: "Masukkan ke nurturing pipeline. Kirim newsletter properti mingguan dan market update. Follow up ringan setiap 2 minggu untuk mengukur perkembangan minat.",
  };
}
