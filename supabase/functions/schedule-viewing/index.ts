import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const {
      property_id,
      agent_id,
      scheduled_at,
      duration_minutes = 60,
      viewing_type = "in_person",
      location_notes,
      investor_notes,
    } = await req.json();

    if (!property_id || !agent_id || !scheduled_at) {
      return new Response(
        JSON.stringify({ error: "property_id, agent_id, and scheduled_at required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Prevent double booking - check agent availability in ±duration window
    const scheduledTime = new Date(scheduled_at);
    const windowStart = new Date(scheduledTime.getTime() - duration_minutes * 60 * 1000);
    const windowEnd = new Date(scheduledTime.getTime() + duration_minutes * 60 * 1000);

    const { data: conflicts } = await adminClient
      .from("property_viewings")
      .select("id, scheduled_at")
      .eq("agent_id", agent_id)
      .in("status", ["requested", "confirmed"])
      .gte("scheduled_at", windowStart.toISOString())
      .lte("scheduled_at", windowEnd.toISOString());

    if (conflicts && conflicts.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Time slot conflicts with existing viewing",
          conflicting_viewings: conflicts.map((c: any) => ({
            id: c.id,
            scheduled_at: c.scheduled_at,
          })),
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check agent blocked dates
    const dateStr = scheduledTime.toISOString().split("T")[0];
    const { data: blocked } = await adminClient
      .from("agent_blocked_dates")
      .select("id")
      .eq("agent_id", agent_id)
      .eq("blocked_date", dateStr)
      .maybeSingle();

    if (blocked) {
      return new Response(
        JSON.stringify({ error: "Agent is unavailable on this date" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create viewing record
    const { data: viewing, error: viewingErr } = await adminClient
      .from("property_viewings")
      .insert({
        property_id,
        agent_id,
        investor_id: userId,
        scheduled_at,
        duration_minutes,
        viewing_type,
        location_notes: location_notes || null,
        investor_notes: investor_notes || null,
        status: "requested",
        offer_probability: 0.15, // baseline boost
      })
      .select()
      .single();

    if (viewingErr) {
      return new Response(
        JSON.stringify({ error: "Failed to create viewing", detail: viewingErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Log behavioral event
    await adminClient.from("behavioral_events").insert({
      user_id: userId,
      property_id,
      event_type: "viewing_scheduled",
      metadata: {
        viewing_id: viewing.id,
        agent_id,
        scheduled_at,
        viewing_type,
      },
    });

    // 5. Emit AI signal for offer probability recalculation
    await adminClient.from("ai_event_signals").insert({
      event_type: "viewing_scheduled",
      entity_type: "property_viewings",
      entity_id: viewing.id,
      priority_level: "medium",
      payload: {
        property_id,
        agent_id,
        investor_id: userId,
        scheduled_at,
      },
    });

    // 6. Track agent response time
    await adminClient.from("agent_response_tracking").insert({
      agent_id,
      inquiry_id: viewing.id,
      inquiry_type: "viewing_request",
      received_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        viewing_id: viewing.id,
        status: "requested",
        scheduled_at,
        message: "Viewing scheduled. Agent will confirm shortly.",
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
