import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[RENTAL-NOTIFICATIONS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Starting rental notification check");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const results = { payment_due: 0, payment_overdue: 0, lease_expiry: 0, inspection: 0, errors: 0 };

    // 1. Payment Due Reminders
    try {
      const { data: bookings } = await supabase
        .from('rental_bookings')
        .select('id, customer_id, property_id, check_in_date, total_amount, payment_status, properties(title)')
        .eq('payment_status', 'unpaid')
        .in('booking_status', ['confirmed', 'pending']);

      if (bookings?.length) {
        for (const booking of bookings) {
          const { data: settings } = await supabase
            .from('rental_notification_settings')
            .select('payment_due_reminder, payment_due_days_before')
            .eq('user_id', booking.customer_id)
            .maybeSingle();

          if (settings?.payment_due_reminder !== false) {
            const daysBefore = settings?.payment_due_days_before || 3;
            const checkIn = new Date(booking.check_in_date);
            const daysUntil = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil > 0 && daysUntil <= daysBefore) {
              // Check if already notified today
              const today = now.toISOString().split('T')[0];
              const { data: existing } = await supabase
                .from('rental_notification_log')
                .select('id')
                .eq('user_id', booking.customer_id)
                .eq('notification_type', 'payment_due')
                .eq('reference_id', booking.id)
                .gte('created_at', today)
                .limit(1);

              if (!existing?.length) {
                const title = (booking as any).properties?.title || 'Properti';
                await supabase.from('rental_notification_log').insert({
                  user_id: booking.customer_id,
                  notification_type: 'payment_due',
                  reference_id: booking.id,
                  reference_type: 'rental_booking',
                  title: `Pembayaran jatuh tempo dalam ${daysUntil} hari`,
                  message: `Pembayaran untuk ${title} sebesar belum dilunasi. Segera lakukan pembayaran sebelum tanggal check-in.`,
                });
                results.payment_due++;
              }
            }
          }
        }
      }
    } catch (e) {
      log("Error in payment due check", { error: String(e) });
      results.errors++;
    }

    // 2. Payment Overdue Alerts
    try {
      const { data: overdueBookings } = await supabase
        .from('rental_bookings')
        .select('id, customer_id, property_id, check_in_date, properties(title)')
        .eq('payment_status', 'unpaid')
        .eq('booking_status', 'confirmed')
        .lt('check_in_date', now.toISOString());

      if (overdueBookings?.length) {
        const today = now.toISOString().split('T')[0];
        for (const booking of overdueBookings) {
          const { data: existing } = await supabase
            .from('rental_notification_log')
            .select('id')
            .eq('user_id', booking.customer_id)
            .eq('notification_type', 'payment_overdue')
            .eq('reference_id', booking.id)
            .gte('created_at', today)
            .limit(1);

          if (!existing?.length) {
            const title = (booking as any).properties?.title || 'Properti';
            await supabase.from('rental_notification_log').insert({
              user_id: booking.customer_id,
              notification_type: 'payment_overdue',
              reference_id: booking.id,
              reference_type: 'rental_booking',
              title: '⚠️ Pembayaran Terlambat',
              message: `Pembayaran untuk ${title} sudah melewati jatuh tempo. Segera lunasi untuk menghindari penalti.`,
            });
            results.payment_overdue++;
          }
        }
      }
    } catch (e) {
      log("Error in overdue check", { error: String(e) });
      results.errors++;
    }

    // 3. Lease Expiry Reminders
    try {
      const { data: expiringBookings } = await supabase
        .from('rental_bookings')
        .select('id, customer_id, owner_id, check_out_date, properties(title)')
        .eq('booking_status', 'confirmed')
        .gt('check_out_date', now.toISOString());

      if (expiringBookings?.length) {
        const today = now.toISOString().split('T')[0];
        for (const booking of expiringBookings) {
          const checkOut = new Date(booking.check_out_date);
          const daysUntil = Math.ceil((checkOut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Notify both tenant and owner
          const userIds = [booking.customer_id, booking.owner_id].filter(Boolean);

          for (const userId of userIds) {
            const { data: settings } = await supabase
              .from('rental_notification_settings')
              .select('lease_expiry_reminder, lease_expiry_days_before')
              .eq('user_id', userId)
              .maybeSingle();

            if (settings?.lease_expiry_reminder !== false) {
              const daysBefore = settings?.lease_expiry_days_before || 30;
              if (daysUntil > 0 && daysUntil <= daysBefore && [30, 14, 7, 3, 1].includes(daysUntil)) {
                const { data: existing } = await supabase
                  .from('rental_notification_log')
                  .select('id')
                  .eq('user_id', userId)
                  .eq('notification_type', 'lease_expiry')
                  .eq('reference_id', booking.id)
                  .gte('created_at', today)
                  .limit(1);

                if (!existing?.length) {
                  const title = (booking as any).properties?.title || 'Properti';
                  await supabase.from('rental_notification_log').insert({
                    user_id: userId,
                    notification_type: 'lease_expiry',
                    reference_id: booking.id,
                    reference_type: 'rental_booking',
                    title: `Kontrak berakhir dalam ${daysUntil} hari`,
                    message: `Kontrak sewa untuk ${title} akan berakhir pada ${checkOut.toLocaleDateString('id-ID')}. Pertimbangkan untuk memperpanjang.`,
                  });
                  results.lease_expiry++;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      log("Error in lease expiry check", { error: String(e) });
      results.errors++;
    }

    // 4. Inspection Reminders
    try {
      const { data: inspections } = await supabase
        .from('property_inspections')
        .select('id, property_id, inspector_id, scheduled_date, inspection_type, properties(title, owner_id)')
        .in('status', ['scheduled', 'pending']);

      if (inspections?.length) {
        const today = now.toISOString().split('T')[0];
        for (const insp of inspections) {
          const schedDate = new Date(insp.scheduled_date);
          const daysUntil = Math.ceil((schedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntil >= 0 && daysUntil <= 2) {
            const ownerId = (insp as any).properties?.owner_id;
            const userIds = [insp.inspector_id, ownerId].filter(Boolean);

            for (const userId of userIds) {
              const { data: existing } = await supabase
                .from('rental_notification_log')
                .select('id')
                .eq('user_id', userId)
                .eq('notification_type', 'inspection')
                .eq('reference_id', insp.id)
                .gte('created_at', today)
                .limit(1);

              if (!existing?.length) {
                const title = (insp as any).properties?.title || 'Properti';
                await supabase.from('rental_notification_log').insert({
                  user_id: userId,
                  notification_type: 'inspection',
                  reference_id: insp.id,
                  reference_type: 'property_inspection',
                  title: daysUntil === 0 ? '🔍 Inspeksi Hari Ini' : `Inspeksi dalam ${daysUntil} hari`,
                  message: `Inspeksi ${insp.inspection_type || ''} untuk ${title} dijadwalkan pada ${schedDate.toLocaleDateString('id-ID')}.`,
                });
                results.inspection++;
              }
            }
          }
        }
      }
    } catch (e) {
      log("Error in inspection check", { error: String(e) });
      results.errors++;
    }

    log("Completed", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    log("ERROR", { message: String(error) });
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
