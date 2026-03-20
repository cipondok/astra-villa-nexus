import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RoutingInput {
  request_id: string;
  top_n?: number;
  auto_assign?: boolean;
  admin_override_vendor_id?: string;
}

interface VendorScore {
  vendor_id: string;
  total_score: number;
  breakdown: {
    rating: number;
    completion: number;
    response_time: number;
    price: number;
    proximity: number;
    capacity: number;
  };
}

// ── Routing Weights ──
const W = {
  rating: 0.30,
  completion: 0.25,
  response_time: 0.20,
  price: 0.10,
  proximity: 0.10,
  capacity: 0.05,
};

function norm(v: number, min: number, max: number) {
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}
function normInv(v: number, min: number, max: number) {
  return Math.max(0, Math.min(100, ((max - v) / (max - min)) * 100));
}

function scoreVendor(
  m: any,
  reqLat?: number | null,
  reqLng?: number | null
): VendorScore {
  const rating = norm(m.avg_rating || 0, 0, 5) * W.rating;
  const completion = norm(m.completion_rate || 0, 0, 100) * W.completion;
  const response_time = normInv(m.avg_response_minutes || 120, 0, 180) * W.response_time;
  const price = norm(m.price_competitiveness_score || 50, 0, 100) * W.price;

  // Proximity: haversine if both coords available
  let proximity = 50 * W.proximity; // default mid
  if (reqLat && reqLng && m.location_lat && m.location_lng) {
    const dist = haversine(reqLat, reqLng, m.location_lat, m.location_lng);
    proximity = normInv(dist, 0, m.service_radius_km || 25) * W.proximity;
  }

  // Capacity: how much room left
  const used = (m.current_active_jobs || 0) / (m.max_concurrent_jobs || 5);
  const capacity = normInv(used * 100, 0, 100) * W.capacity;

  const total_score = Math.round((rating + completion + response_time + price + proximity + capacity) * 10) / 10;

  return {
    vendor_id: m.vendor_id,
    total_score,
    breakdown: {
      rating: Math.round(rating * 10) / 10,
      completion: Math.round(completion * 10) / 10,
      response_time: Math.round(response_time * 10) / 10,
      price: Math.round(price * 10) / 10,
      proximity: Math.round(proximity * 10) / 10,
      capacity: Math.round(capacity * 10) / 10,
    },
  };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: RoutingInput = await req.json();
    const { request_id, top_n = 5, auto_assign = false, admin_override_vendor_id } = body;

    if (!request_id) throw new Error("request_id is required");

    // 1. Fetch the service request
    const { data: request, error: reqErr } = await supabase
      .from("vendor_service_requests")
      .select("*")
      .eq("id", request_id)
      .single();
    if (reqErr || !request) throw new Error("Service request not found");

    // 2. Admin override path
    if (admin_override_vendor_id) {
      await supabase.from("vendor_service_requests").update({
        assigned_vendor_id: admin_override_vendor_id,
        assigned_at: new Date().toISOString(),
        status: "assigned",
        admin_override: true,
        updated_at: new Date().toISOString(),
      }).eq("id", request_id);

      await supabase.from("vendor_job_assignments").insert({
        request_id,
        vendor_id: admin_override_vendor_id,
        routing_score: 100,
        rank: 1,
        status: "accepted",
        responded_at: new Date().toISOString(),
        routing_breakdown: { admin_override: true },
      });

      return new Response(JSON.stringify({ success: true, mode: "admin_override", assigned_to: admin_override_vendor_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Fetch eligible vendors
    const { data: vendors, error: vErr } = await supabase
      .from("vendor_metrics")
      .select("*")
      .eq("category", request.category)
      .eq("is_available", true);
    if (vErr) throw vErr;
    if (!vendors?.length) {
      return new Response(JSON.stringify({ success: false, error: "No available vendors for this category", ranked: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Score and rank
    const scored = vendors
      .map((v: any) => scoreVendor(v, request.location_lat, request.location_lng))
      .sort((a: VendorScore, b: VendorScore) => b.total_score - a.total_score);

    const topVendors = scored.slice(0, top_n);
    const backups = scored.slice(top_n, top_n + 3);

    // 5. Create assignment records
    const slaHours = request.sla_deadline_hours || 24;
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    const assignments = topVendors.map((v: VendorScore, i: number) => ({
      request_id,
      vendor_id: v.vendor_id,
      routing_score: v.total_score,
      rank: i + 1,
      status: "offered",
      response_deadline: deadline,
      is_backup: false,
      routing_breakdown: v.breakdown,
    }));

    const backupAssignments = backups.map((v: VendorScore, i: number) => ({
      request_id,
      vendor_id: v.vendor_id,
      routing_score: v.total_score,
      rank: topVendors.length + i + 1,
      status: "offered",
      response_deadline: deadline,
      is_backup: true,
      routing_breakdown: v.breakdown,
    }));

    await supabase.from("vendor_job_assignments").insert([...assignments, ...backupAssignments]);

    // 6. Auto-assign top vendor if requested
    if (auto_assign && topVendors.length > 0) {
      const best = topVendors[0];
      await supabase.from("vendor_service_requests").update({
        assigned_vendor_id: best.vendor_id,
        assigned_at: new Date().toISOString(),
        status: "assigned",
        updated_at: new Date().toISOString(),
      }).eq("id", request_id);

      await supabase.from("vendor_job_assignments")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("request_id", request_id)
        .eq("vendor_id", best.vendor_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        request_id,
        auto_assigned: auto_assign ? topVendors[0]?.vendor_id : null,
        ranked: topVendors,
        backups,
        total_candidates: vendors.length,
        sla_deadline: deadline,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
