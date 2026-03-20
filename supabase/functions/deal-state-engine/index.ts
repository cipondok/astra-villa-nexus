import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STAGES = [
  "inquiry",
  "viewing_scheduled",
  "offer_submitted",
  "negotiation",
  "payment_initiated",
  "legal_verification",
  "closed",
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_IDX = Object.fromEntries(STAGES.map((s, i) => [s, i])) as Record<Stage, number>;

const REQUIRED_DOCS: Record<Stage, string[]> = {
  inquiry: [],
  viewing_scheduled: [],
  offer_submitted: ["offer_letter"],
  negotiation: ["offer_letter"],
  payment_initiated: ["offer_letter", "payment_proof"],
  legal_verification: ["offer_letter", "payment_proof", "ktp", "npwp"],
  closed: ["offer_letter", "payment_proof", "ktp", "npwp", "ajb"],
};

const RESPONSIBLE: Record<Stage, string> = {
  inquiry: "agent",
  viewing_scheduled: "agent",
  offer_submitted: "agent",
  negotiation: "agent",
  payment_initiated: "admin",
  legal_verification: "admin",
  closed: "admin",
};

const PROBABILITY: Record<Stage, number> = {
  inquiry: 10,
  viewing_scheduled: 25,
  offer_submitted: 45,
  negotiation: 60,
  payment_initiated: 80,
  legal_verification: 92,
  closed: 100,
};

interface TransitionRequest {
  deal_id: string;
  target_stage: Stage;
  actor_id?: string;
  force_override?: boolean;
  notes?: string;
}

interface StallCheckRequest {
  mode: "stall_check";
  stall_hours?: number;
}

function isValidTransition(from: Stage, to: Stage, force: boolean): boolean {
  if (force) return true;
  const fromIdx = STAGE_IDX[from];
  const toIdx = STAGE_IDX[to];
  // Allow forward by 1, or back to any previous stage
  return toIdx === fromIdx + 1 || toIdx < fromIdx;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const body = await req.json();

    // ─── Stall Detection Mode ─────────────────────────────────────────
    if (body.mode === "stall_check") {
      const stallHours = (body as StallCheckRequest).stall_hours ?? 48;
      const cutoff = new Date(Date.now() - stallHours * 3600_000).toISOString();

      const { data: stalled, error } = await sb
        .from("property_deals")
        .select("id, status, updated_at, property_id, buyer_id, agent_id")
        .neq("status", "closed")
        .neq("status", "cancelled")
        .lt("updated_at", cutoff)
        .limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          stalled_deals: stalled?.length ?? 0,
          deals: (stalled ?? []).map((d: any) => ({
            deal_id: d.id,
            current_stage: d.status,
            last_updated: d.updated_at,
            stall_hours: Math.round(
              (Date.now() - new Date(d.updated_at).getTime()) / 3600_000
            ),
            responsible: RESPONSIBLE[d.status as Stage] ?? "admin",
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Stage Transition Mode ────────────────────────────────────────
    const {
      deal_id,
      target_stage,
      actor_id,
      force_override = false,
      notes,
    } = body as TransitionRequest;

    if (!deal_id || !target_stage) {
      return new Response(
        JSON.stringify({ error: "deal_id and target_stage required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!STAGES.includes(target_stage)) {
      return new Response(
        JSON.stringify({ error: `Invalid stage: ${target_stage}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current deal
    const { data: deal, error: dErr } = await sb
      .from("property_deals")
      .select("*")
      .eq("id", deal_id)
      .maybeSingle();

    if (dErr) throw dErr;
    if (!deal) {
      return new Response(
        JSON.stringify({ error: "Deal not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentStage = (deal.status ?? "inquiry") as Stage;

    if (!isValidTransition(currentStage, target_stage, force_override)) {
      return new Response(
        JSON.stringify({
          error: `Cannot transition from ${currentStage} to ${target_stage}`,
          allowed_next: STAGES[STAGE_IDX[currentStage] + 1] ?? null,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update deal status
    const { error: uErr } = await sb
      .from("property_deals")
      .update({
        status: target_stage,
        deal_probability: PROBABILITY[target_stage],
        updated_at: new Date().toISOString(),
      })
      .eq("id", deal_id);

    if (uErr) throw uErr;

    // Log stage history
    await sb.from("deal_stage_history").insert({
      deal_id,
      from_stage: currentStage,
      to_stage: target_stage,
      actor_id: actor_id ?? null,
      notes: notes ?? null,
      probability: PROBABILITY[target_stage],
    });

    // Generate automation tasks
    const tasks: { task_type: string; description: string; assigned_role: string }[] = [];
    const responsible = RESPONSIBLE[target_stage];

    if (target_stage === "viewing_scheduled") {
      tasks.push({ task_type: "schedule", description: "Confirm viewing time with buyer", assigned_role: "agent" });
    }
    if (target_stage === "offer_submitted") {
      tasks.push({ task_type: "review", description: "Review offer terms and respond within 24h", assigned_role: "agent" });
    }
    if (target_stage === "negotiation") {
      tasks.push({ task_type: "negotiate", description: "Facilitate counter-offer discussion", assigned_role: "agent" });
      tasks.push({ task_type: "finance", description: "Check buyer financing eligibility", assigned_role: "admin" });
    }
    if (target_stage === "payment_initiated") {
      tasks.push({ task_type: "escrow", description: "Set up escrow and verify payment", assigned_role: "admin" });
    }
    if (target_stage === "legal_verification") {
      tasks.push({ task_type: "legal", description: "Coordinate notary and document verification", assigned_role: "admin" });
      tasks.push({ task_type: "vendor", description: "Suggest inspection and appraisal vendors", assigned_role: "admin" });
    }
    if (target_stage === "closed") {
      tasks.push({ task_type: "close", description: "Finalize AJB and handover", assigned_role: "admin" });
      tasks.push({ task_type: "commission", description: "Calculate and process commissions", assigned_role: "admin" });
    }

    if (tasks.length > 0) {
      await sb.from("deal_tasks").insert(
        tasks.map((t) => ({
          deal_id,
          task_type: t.task_type,
          description: t.description,
          assigned_role: t.assigned_role,
          status: "pending",
        }))
      );
    }

    return new Response(
      JSON.stringify({
        deal_id,
        previous_stage: currentStage,
        current_stage: target_stage,
        probability: PROBABILITY[target_stage],
        responsible,
        required_docs: REQUIRED_DOCS[target_stage],
        tasks_created: tasks.length,
        force_override,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
