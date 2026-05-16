export interface AIDiagnosticsInput {
  actions_count: number;
  execution_logs: number;
  widgets: number;
  db_updates: number;
}

export type AISystemStatus = "NOT ACTIVE" | "PARTIALLY ACTIVE" | "FULLY ACTIVE";

export interface AIDiagnosticsResult {
  ai_system_status: AISystemStatus;
  integration_issue: string;
  fix_steps: string[];
  priority_test_module: string;
  composite_score: number;
  health_breakdown: {
    deployment: number;
    execution: number;
    visibility: number;
    persistence: number;
  };
}

/**
 * Evaluates AI platform health from 4 operational signals.
 *
 * Composite = deployment * 0.20 + execution * 0.35 + visibility * 0.20 + persistence * 0.25
 *
 * 76-100 → FULLY ACTIVE
 * 36-75  → PARTIALLY ACTIVE
 * 0-35   → NOT ACTIVE
 */
export function diagnoseAISystem(input: AIDiagnosticsInput): AIDiagnosticsResult {
  const { actions_count, execution_logs, widgets, db_updates } = input;

  // Normalize each signal to 0-100
  const deployment = Math.min(100, Math.round(Math.log2(Math.max(1, actions_count) + 1) * 20));
  const execution = Math.min(100, Math.round(Math.log2(Math.max(1, execution_logs) + 1) * 18));
  const visibility = Math.min(100, Math.round(Math.log2(Math.max(1, widgets) + 1) * 25));
  const persistence = Math.min(100, Math.round(Math.log2(Math.max(1, db_updates) + 1) * 15));

  const composite = Math.round(
    deployment * 0.20 + execution * 0.35 + visibility * 0.20 + persistence * 0.25
  );

  let ai_system_status: AISystemStatus;
  if (composite >= 76) ai_system_status = "FULLY ACTIVE";
  else if (composite >= 36) ai_system_status = "PARTIALLY ACTIVE";
  else ai_system_status = "NOT ACTIVE";

  // --- Bottleneck detection ---
  const scores = { deployment, execution, visibility, persistence };
  const weakest = (Object.entries(scores) as [string, number][]).sort((a, b) => a[1] - b[1])[0];

  let integration_issue: string;
  let fix_steps: string[];
  let priority_test_module: string;

  switch (weakest[0]) {
    case "deployment":
      integration_issue = "AI actions belum ter-deploy atau jumlah endpoint sangat terbatas — edge function mungkin belum di-deploy ulang setelah perubahan terakhir.";
      fix_steps = [
        "Verifikasi semua edge functions ter-deploy via Supabase Dashboard → Functions.",
        "Cek config.toml untuk memastikan semua function terdaftar dengan verify_jwt = false.",
        "Re-deploy ai-engine dan core-engine edge functions.",
        "Validasi response dari setiap action dengan curl test.",
      ];
      priority_test_module = "Edge Function Deployment (ai-engine)";
      break;

    case "execution":
      integration_issue = "AI execution logs kosong atau sangat sedikit — kemungkinan function tidak dipanggil oleh frontend, atau error silent terjadi di backend.";
      fix_steps = [
        "Periksa Edge Function logs di Supabase Dashboard untuk error 500/429/402.",
        "Verifikasi LOVABLE_API_KEY tersedia di Supabase secrets.",
        "Cek frontend hooks (useMutation/useQuery) apakah enabled dan tidak di-skip.",
        "Test manual satu action via supabase.functions.invoke() dari browser console.",
      ];
      priority_test_module = "AI Engine Execution (macro-forecast atau spatial-heat)";
      break;

    case "visibility":
      integration_issue = "AI widgets tidak muncul di UI — komponen belum di-mount, conditional rendering memblokir, atau data belum tersedia saat render.";
      fix_steps = [
        "Audit halaman utama: pastikan AI insight cards/panels ter-import dan ter-render.",
        "Cek conditional rendering (isLoading, data?.length) yang mungkin menyembunyikan widget.",
        "Verifikasi lazy-loaded components memiliki proper Suspense fallback.",
        "Test dengan hardcoded mock data untuk isolasi masalah data vs rendering.",
      ];
      priority_test_module = "AI Widget Rendering (MarketContextCard atau InvestmentBadge)";
      break;

    case "persistence":
    default:
      integration_issue = "Database AI fields tidak terupdate — background jobs mungkin gagal, atau write-back dari edge function ke tabel cache tidak berjalan.";
      fix_steps = [
        "Cek tabel ai_intelligence_cache, property_investment_scores, dan property_ai_insights untuk last_updated.",
        "Verifikasi pg_cron jobs aktif via Supabase SQL Editor: SELECT * FROM cron.job;",
        "Periksa ai_batch_locks untuk stale locks yang memblokir eksekusi.",
        "Jalankan manual trigger untuk satu background job dan monitor hasilnya.",
      ];
      priority_test_module = "Background Job Pipeline (calculate_investment_scores)";
      break;
  }

  return {
    ai_system_status,
    integration_issue,
    fix_steps,
    priority_test_module,
    composite_score: composite,
    health_breakdown: { deployment, execution, visibility, persistence },
  };
}
