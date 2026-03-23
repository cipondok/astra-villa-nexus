import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params = {} } = await req.json();

    switch (mode) {
      case "dashboard": {
        const [accounts, ledger, recon, routing, spvs, reports] = await Promise.all([
          sb.from("custody_accounts").select("*").order("created_at", { ascending: false }).limit(50),
          sb.from("custody_ledger_entries").select("*").order("created_at", { ascending: false }).limit(100),
          sb.from("settlement_reconciliation_records").select("*").order("reconciliation_date", { ascending: false }).limit(30),
          sb.from("settlement_routing_profiles").select("*").eq("active_flag", true),
          sb.from("asset_spv_entities").select("*").order("created_at", { ascending: false }).limit(20),
          sb.from("regulatory_reporting_events").select("*").order("generated_at", { ascending: false }).limit(20),
        ]);

        const totalCustody = (ledger.data || []).reduce((s: number, e: any) => s + (e.credit_amount || 0) - (e.debit_amount || 0), 0);
        const discrepancies = (recon.data || []).filter((r: any) => r.discrepancy_flag).length;
        const jurisdictions = [...new Set((accounts.data || []).map((a: any) => a.jurisdiction_code))];

        return json({
          total_assets_under_custody: totalCustody,
          active_accounts: (accounts.data || []).filter((a: any) => a.custody_status === "active").length,
          discrepancy_alerts: discrepancies,
          jurisdictions,
          accounts: accounts.data || [],
          recent_ledger: (ledger.data || []).slice(0, 20),
          reconciliation: recon.data || [],
          routing_profiles: routing.data || [],
          spv_entities: spvs.data || [],
          regulatory_reports: reports.data || [],
        });
      }

      case "reconcile": {
        const { custody_account_id } = params;
        // Sum ledger to get expected balance
        const { data: entries } = await sb
          .from("custody_ledger_entries")
          .select("debit_amount, credit_amount")
          .eq("custody_account_id", custody_account_id);

        const expected = (entries || []).reduce(
          (s: number, e: any) => s + (e.credit_amount || 0) - (e.debit_amount || 0), 0
        );

        // In production, actual_balance would come from bank/custodian API
        const actual = expected; // Placeholder for external integration
        const discrepancy = Math.abs(expected - actual) > 0.01;

        await sb.from("settlement_reconciliation_records").insert({
          custody_account_id,
          expected_balance: expected,
          actual_balance: actual,
          discrepancy_flag: discrepancy,
        });

        return json({ expected_balance: expected, actual_balance: actual, discrepancy_flag: discrepancy });
      }

      case "create_custody_account": {
        const { entity_type, entity_reference_id, custody_provider_code, jurisdiction_code, base_currency } = params;
        const { data, error } = await sb.from("custody_accounts").insert({
          entity_type: entity_type || "investor",
          entity_reference_id,
          custody_provider_code: custody_provider_code || "internal",
          jurisdiction_code: jurisdiction_code || "ID",
          base_currency: base_currency || "USD",
        }).select().single();
        if (error) throw error;
        return json(data);
      }

      case "record_ledger_entry": {
        const { custody_account_id, asset_type, debit_amount, credit_amount, currency, reference_transaction, entry_reason } = params;

        // Get current balance
        const { data: entries } = await sb
          .from("custody_ledger_entries")
          .select("debit_amount, credit_amount")
          .eq("custody_account_id", custody_account_id);

        const currentBalance = (entries || []).reduce(
          (s: number, e: any) => s + (e.credit_amount || 0) - (e.debit_amount || 0), 0
        );
        const newBalance = currentBalance + (credit_amount || 0) - (debit_amount || 0);

        const { data, error } = await sb.from("custody_ledger_entries").insert({
          custody_account_id,
          asset_type: asset_type || "cash",
          debit_amount: debit_amount || 0,
          credit_amount: credit_amount || 0,
          currency: currency || "USD",
          reference_transaction,
          balance_snapshot: newBalance,
          entry_reason,
        }).select().single();
        if (error) throw error;
        return json(data);
      }

      case "generate_regulatory_report": {
        const { jurisdiction_code, report_type, related_entity_id, report_payload } = params;
        const { data, error } = await sb.from("regulatory_reporting_events").insert({
          jurisdiction_code: jurisdiction_code || "ID",
          report_type,
          related_entity_id,
          report_payload: report_payload || {},
        }).select().single();
        if (error) throw error;
        return json(data);
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});
