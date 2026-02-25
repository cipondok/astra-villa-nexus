import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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
    const in3Days = new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0];
    const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

    // 1. Upcoming check-in reminders (within 3 days)
    const { data: upcomingCheckins } = await supabase
      .from("rental_bookings")
      .select("id, check_in_date, total_amount, payment_status, deposit_status, customer_id, property_id")
      .gte("check_in_date", today)
      .lte("check_in_date", in3Days)
      .in("booking_status", ["confirmed", "pending"])
      .neq("payment_status", "paid");

    // 2. Overdue payments (check-in passed but unpaid)
    const { data: overduePayments } = await supabase
      .from("rental_bookings")
      .select("id, check_in_date, total_amount, payment_status, deposit_status, customer_id, property_id")
      .lt("check_in_date", today)
      .in("booking_status", ["confirmed", "pending"])
      .in("payment_status", ["unpaid", "partial"]);

    // 3. Deposit pending reminders (within 7 days of check-in)
    const { data: depositPending } = await supabase
      .from("rental_bookings")
      .select("id, check_in_date, deposit_amount, deposit_status, customer_id, property_id")
      .gte("check_in_date", today)
      .lte("check_in_date", in7Days)
      .in("booking_status", ["confirmed", "pending"])
      .eq("deposit_status", "pending");

    const alerts: any[] = [];

    // Generate upcoming check-in payment alerts
    for (const booking of upcomingCheckins || []) {
      alerts.push({
        type: "payment_reminder",
        title: "Pembayaran Mendatang",
        message: `Booking #${booking.id.slice(0, 8)} check-in ${booking.check_in_date} — pembayaran ${booking.payment_status === "partial" ? "belum lunas" : "belum dibayar"}. Total: Rp ${Number(booking.total_amount).toLocaleString("id-ID")}`,
        priority: "high",
        reference_id: booking.id,
        reference_type: "rental_booking",
        action_required: true,
        alert_category: "rental",
        auto_generated: true,
        urgency_level: 3,
        metadata: { customer_id: booking.customer_id, property_id: booking.property_id, reminder_type: "upcoming_payment" },
      });
    }

    // Generate overdue payment alerts
    for (const booking of overduePayments || []) {
      alerts.push({
        type: "payment_overdue",
        title: "Pembayaran Terlambat!",
        message: `Booking #${booking.id.slice(0, 8)} sudah melewati check-in (${booking.check_in_date}) tetapi pembayaran masih ${booking.payment_status}. Total: Rp ${Number(booking.total_amount).toLocaleString("id-ID")}`,
        priority: "critical",
        reference_id: booking.id,
        reference_type: "rental_booking",
        action_required: true,
        alert_category: "rental",
        auto_generated: true,
        urgency_level: 4,
        metadata: { customer_id: booking.customer_id, property_id: booking.property_id, reminder_type: "overdue_payment" },
      });
    }

    // Generate deposit pending alerts
    for (const booking of depositPending || []) {
      alerts.push({
        type: "deposit_reminder",
        title: "Deposit Belum Dibayar",
        message: `Deposit untuk booking #${booking.id.slice(0, 8)} (check-in ${booking.check_in_date}) belum dibayar. Deposit: Rp ${Number(booking.deposit_amount || 0).toLocaleString("id-ID")}`,
        priority: "medium",
        reference_id: booking.id,
        reference_type: "rental_booking",
        action_required: true,
        alert_category: "rental",
        auto_generated: true,
        urgency_level: 2,
        metadata: { customer_id: booking.customer_id, property_id: booking.property_id, reminder_type: "deposit_pending" },
      });
    }

    // Deduplicate: don't create alerts for bookings that already have a recent alert today
    if (alerts.length > 0) {
      const bookingIds = alerts.map((a) => a.reference_id);
      const { data: existingAlerts } = await supabase
        .from("admin_alerts")
        .select("reference_id")
        .in("reference_id", bookingIds)
        .in("type", ["payment_reminder", "payment_overdue", "deposit_reminder"])
        .gte("created_at", `${today}T00:00:00`);

      const existingIds = new Set((existingAlerts || []).map((a: any) => a.reference_id));
      const newAlerts = alerts.filter((a) => !existingIds.has(a.reference_id));

      if (newAlerts.length > 0) {
        const { error } = await supabase.from("admin_alerts").insert(newAlerts);
        if (error) throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          total_checked: {
            upcoming: upcomingCheckins?.length || 0,
            overdue: overduePayments?.length || 0,
            deposit_pending: depositPending?.length || 0,
          },
          alerts_created: newAlerts.length,
          skipped_duplicates: alerts.length - newAlerts.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, alerts_created: 0, message: "No payment reminders needed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
