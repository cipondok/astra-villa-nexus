export type FairnessStatus = 'BALANCED' | 'SLIGHTLY_CONCENTRATED' | 'OVERLOADED' | 'CRITICALLY_UNFAIR';

export interface LeadFairnessResult {
  fairness_status: FairnessStatus;
  redistribution_rule: string;
  fairness_summary: string;
  concentration_ratio: number;
}

/**
 * Evaluates lead distribution fairness by comparing an agent's assigned leads
 * against the platform average.
 *
 * Concentration Ratio = assigned / avg
 *   <= 1.2  → BALANCED
 *   <= 1.5  → SLIGHTLY_CONCENTRATED
 *   <= 2.0  → OVERLOADED
 *   > 2.0   → CRITICALLY_UNFAIR
 */
export function evaluateLeadFairness(assigned_leads: number, avg_leads: number): LeadFairnessResult {
  const avg = Math.max(1, avg_leads);
  const ratio = Math.round((assigned_leads / avg) * 100) / 100;

  if (ratio <= 1.2) {
    return {
      fairness_status: 'BALANCED',
      concentration_ratio: ratio,
      redistribution_rule: 'Tidak diperlukan penyesuaian. Distribusi leads sudah merata dan seimbang antar agen.',
      fairness_summary: `Agen menerima ${assigned_leads} leads vs rata-rata ${avg_leads} (rasio ${ratio}x). Distribusi dalam batas wajar — tidak ada risiko konsentrasi.`,
    };
  }

  if (ratio <= 1.5) {
    return {
      fairness_status: 'SLIGHTLY_CONCENTRATED',
      concentration_ratio: ratio,
      redistribution_rule: 'Terapkan soft cap: leads baru dialihkan ke agen dengan beban lebih rendah jika agen ini sudah melebihi 120% rata-rata.',
      fairness_summary: `Agen menerima ${assigned_leads} leads vs rata-rata ${avg_leads} (rasio ${ratio}x). Sedikit di atas rata-rata — monitor dan siapkan redistribusi jika terus naik.`,
    };
  }

  if (ratio <= 2.0) {
    return {
      fairness_status: 'OVERLOADED',
      concentration_ratio: ratio,
      redistribution_rule: 'Aktifkan hard cap: blokir leads baru untuk agen ini dan alihkan otomatis ke agen terdekat dengan kapasitas tersedia dan rating >= 4.0.',
      fairness_summary: `Agen menerima ${assigned_leads} leads vs rata-rata ${avg_leads} (rasio ${ratio}x). Beban berlebih — kualitas layanan berisiko menurun. Redistribusi segera diperlukan.`,
    };
  }

  return {
    fairness_status: 'CRITICALLY_UNFAIR',
    concentration_ratio: ratio,
    redistribution_rule: 'Terapkan emergency redistribution: freeze assignment untuk agen ini, distribusikan leads tertunda ke 3 agen dengan beban terendah secara round-robin.',
    fairness_summary: `Agen menerima ${assigned_leads} leads vs rata-rata ${avg_leads} (rasio ${ratio}x). Konsentrasi kritis — monopoli leads mengancam fairness platform dan retensi agen lain.`,
  };
}
