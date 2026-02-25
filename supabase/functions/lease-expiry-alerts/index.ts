import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Find active bookings expiring within 14 days
    const fourteenDaysLater = new Date(now);
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    const cutoffDate = fourteenDaysLater.toISOString().split("T")[0];

    const { data: expiringBookings, error } = await supabase
      .from("rental_bookings")
      .select("id, check_out_date, total_amount, property_id, customer_id, properties(title, owner_id)")
      .in("booking_status", ["confirmed", "pending"])
      .gte("check_out_date", today)
      .lte("check_out_date", cutoffDate)
      .order("check_out_date", { ascending: true });

    if (error) throw error;

    let alertsCreated = 0;

    for (const booking of expiringBookings || []) {
      const checkOut = new Date(booking.check_out_date);
      const daysLeft = Math.ceil((checkOut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let priority: string;
      let title: string;
      if (daysLeft <= 3) {
        priority = "critical";
        title = `⚠️ Sewa "${(booking as any).properties?.title}" berakhir dalam ${daysLeft} hari!`;
      } else if (daysLeft <= 7) {
        priority = "high";
        title = `🔔 Sewa "${(booking as any).properties?.title}" berakhir dalam ${daysLeft} hari`;
      } else {
        priority = "medium";
        title = `📋 Sewa "${(booking as any).properties?.title}" berakhir dalam ${daysLeft} hari`;
      }

      // Check for duplicate alert today
      const { data: existing } = await supabase
        .from("admin_alerts")
        .select("id")
        .eq("reference_id", booking.id)
        .eq("reference_type", "lease_expiry")
        .gte("created_at", `${today}T00:00:00Z`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      await supabase.from("admin_alerts").insert({
        title,
        message: `Booking #${booking.id.slice(0, 8)} untuk properti "${(booking as any).properties?.title}" akan berakhir pada ${booking.check_out_date}. Pertimbangkan untuk mengirim penawaran perpanjangan.`,
        type: "lease_expiry",
        priority,
        alert_category: "rental",
        reference_id: booking.id,
        reference_type: "lease_expiry",
        action_required: daysLeft <= 7,
        metadata: {
          booking_id: booking.id,
          property_id: booking.property_id,
          tenant_id: booking.customer_id,
          days_remaining: daysLeft,
          check_out_date: booking.check_out_date,
        },
      });

      alertsCreated++;
    }

    return new Response(
      JSON.stringify({ success: true, expiring: expiringBookings?.length || 0, alerts_created: alertsCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
