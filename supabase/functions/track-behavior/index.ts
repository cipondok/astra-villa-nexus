import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_EVENTS = new Set([
  "property_view", "property_save", "inquiry_start", "inquiry_submit",
  "negotiation_open", "negotiation_message", "deal_intent_signal",
  "search_performed", "filter_applied", "map_interaction",
  "investor_dashboard_view", "escrow_info_view", "pricing_simulation_run",
  "agent_profile_view", "wallet_view", "property_share",
]);

const MAX_BATCH = 50;
const RATE_LIMIT_PER_SESSION = 200; // max events per session per 5 min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + 300000 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_PER_SESSION;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { events, session_id } = body;

    if (!events?.length || !session_id) {
      return new Response(JSON.stringify({ error: "events[] and session_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit check
    if (isRateLimited(session_id)) {
      return new Response(JSON.stringify({ error: "Rate limited", accepted: 0 }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve user from auth header
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await sb.auth.getUser(token);
        if (user) userId = user.id;
      } catch { /* anonymous user */ }
    }

    // Validate and prepare rows
    const rows = events.slice(0, MAX_BATCH)
      .filter((e: any) => e.event_type && VALID_EVENTS.has(e.event_type))
      .map((e: any) => ({
        user_id: userId,
        session_id,
        event_type: e.event_type,
        property_id: e.property_id || null,
        city: e.city || null,
        metadata_json: e.metadata || {},
        event_value: e.value ?? null,
      }));

    if (rows.length === 0) {
      return new Response(JSON.stringify({ accepted: 0, reason: "no valid events" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await sb.from("behavioral_events").insert(rows);
    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Insert failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ accepted: rows.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("track-behavior error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});