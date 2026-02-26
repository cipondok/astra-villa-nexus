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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const in3Days = new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0];
    const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];
    const in14Days = new Date(now.getTime() + 14 * 86400000).toISOString().split("T")[0];

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

    // 4. Invoice-based reminders — unpaid invoices approaching/past due date
    const { data: unpaidInvoices } = await supabase
      .from("rental_invoices")
      .select("id, invoice_number, tenant_id, property_id, total_amount, due_date, status, booking_id")
      .eq("status", "unpaid")
      .lte("due_date", in14Days);

    // 5. Fetch automation settings for late fee processing
    const { data: automationSettings } = await supabase
      .from("payment_automation_settings")
      .select("*")
      .eq("late_fee_enabled", true);

    const settingsByOwner = new Map((automationSettings || []).map((s: any) => [s.owner_id, s]));

    const alerts: any[] = [];
    let lateFeeInvoicesCreated = 0;

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

    // Process invoice-based reminders and late fees
    for (const invoice of unpaidInvoices || []) {
      const dueDate = new Date(invoice.due_date + "T00:00:00");
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
      const daysOverdue = -daysUntilDue;

      if (daysUntilDue > 0 && daysUntilDue <= 7) {
        // Upcoming invoice reminder
        alerts.push({
          type: "invoice_reminder",
          title: "Invoice Akan Jatuh Tempo",
          message: `Invoice ${invoice.invoice_number} jatuh tempo dalam ${daysUntilDue} hari (${invoice.due_date}). Total: Rp ${Number(invoice.total_amount).toLocaleString("id-ID")}`,
          priority: daysUntilDue <= 1 ? "high" : "medium",
          reference_id: invoice.id,
          reference_type: "rental_invoice",
          action_required: true,
          alert_category: "rental",
          auto_generated: true,
          urgency_level: daysUntilDue <= 1 ? 3 : 2,
          metadata: { tenant_id: invoice.tenant_id, property_id: invoice.property_id, reminder_type: "invoice_due_soon", days_until_due: daysUntilDue },
        });
      } else if (daysOverdue > 0) {
        // Overdue invoice alert
        alerts.push({
          type: "invoice_overdue",
          title: "Invoice Terlambat!",
          message: `Invoice ${invoice.invoice_number} sudah terlambat ${daysOverdue} hari. Total: Rp ${Number(invoice.total_amount).toLocaleString("id-ID")}`,
          priority: "critical",
          reference_id: invoice.id,
          reference_type: "rental_invoice",
          action_required: true,
          alert_category: "rental",
          auto_generated: true,
          urgency_level: daysOverdue > 7 ? 5 : 4,
          metadata: { tenant_id: invoice.tenant_id, property_id: invoice.property_id, reminder_type: "invoice_overdue", days_overdue: daysOverdue },
        });

        // Auto late fee: find owner of property, check settings
        if (invoice.property_id) {
          const { data: prop } = await supabase
            .from("properties")
            .select("owner_id")
            .eq("id", invoice.property_id)
            .single();

          if (prop?.owner_id) {
            const ownerSettings = settingsByOwner.get(prop.owner_id);
            if (ownerSettings && ownerSettings.late_fee_enabled && daysOverdue > (ownerSettings.grace_period_days || 0)) {
              // Check if we already created a penalty invoice for this invoice today
              const { data: existingPenalty } = await supabase
                .from("rental_invoices")
                .select("id")
                .eq("invoice_type", "penalty")
                .eq("booking_id", invoice.booking_id)
                .gte("created_at", `${today}T00:00:00`)
                .limit(1);

              if (!existingPenalty?.length) {
                let feeAmount = 0;
                if (ownerSettings.late_fee_type === "fixed") {
                  feeAmount = ownerSettings.late_fee_amount || 0;
                } else {
                  feeAmount = (invoice.total_amount * (ownerSettings.late_fee_percentage || 0)) / 100;
                }
                if (ownerSettings.max_late_fee_amount > 0) {
                  feeAmount = Math.min(feeAmount, ownerSettings.max_late_fee_amount);
                }

                if (feeAmount > 0) {
                  const penaltyNumber = `PEN-${Date.now().toString(36).toUpperCase()}`;
                  await supabase.from("rental_invoices").insert([{
                    invoice_number: penaltyNumber,
                    booking_id: invoice.booking_id,
                    property_id: invoice.property_id,
                    tenant_id: invoice.tenant_id,
                    issued_by: prop.owner_id,
                    invoice_type: "penalty",
                    description: `Denda keterlambatan invoice ${invoice.invoice_number} (${daysOverdue} hari)`,
                    amount: feeAmount,
                    tax_amount: 0,
                    total_amount: feeAmount,
                    due_date: today,
                    notes: `Auto-generated late fee for invoice ${invoice.invoice_number}`,
                  }]);
                  lateFeeInvoicesCreated++;
                }
              }
            }
          }
        }
      }
    }

    // Deduplicate: don't create alerts for references that already have a recent alert today
    if (alerts.length > 0) {
      const refIds = alerts.map((a) => a.reference_id);
      const { data: existingAlerts } = await supabase
        .from("admin_alerts")
        .select("reference_id, type")
        .in("reference_id", refIds)
        .in("type", ["payment_reminder", "payment_overdue", "deposit_reminder", "invoice_reminder", "invoice_overdue"])
        .gte("created_at", `${today}T00:00:00`);

      const existingKeys = new Set((existingAlerts || []).map((a: any) => `${a.reference_id}:${a.type}`));
      const newAlerts = alerts.filter((a) => !existingKeys.has(`${a.reference_id}:${a.type}`));

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
            unpaid_invoices: unpaidInvoices?.length || 0,
          },
          alerts_created: newAlerts.length,
          skipped_duplicates: alerts.length - newAlerts.length,
          late_fee_invoices_created: lateFeeInvoicesCreated,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, alerts_created: 0, late_fee_invoices_created: lateFeeInvoicesCreated, message: "No payment reminders needed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});