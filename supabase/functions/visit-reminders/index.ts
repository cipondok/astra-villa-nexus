import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@4.0.0";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = resendKey ? new Resend(resendKey) : null;

    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const todayStr = now.toISOString().split("T")[0];
    const tomorrowStr = in24h.toISOString().split("T")[0];

    // Get visits happening today or tomorrow that haven't had reminders sent
    const { data: visits, error } = await supabase
      .from("property_visits")
      .select("*")
      .in("status", ["pending", "confirmed"])
      .in("visit_date", [todayStr, tomorrowStr])
      .or("reminder_24h_sent.eq.false,reminder_1h_sent.eq.false");

    if (error) {
      console.error("Error fetching visits:", error);
      throw error;
    }

    console.log(`Found ${visits?.length || 0} visits to check for reminders`);

    const results = { sent_24h: 0, sent_1h: 0, in_app: 0, errors: 0 };

    for (const visit of visits || []) {
      const [vh, vm] = visit.start_time.split(":").map(Number);
      const visitDateTime = new Date(`${visit.visit_date}T${String(vh).padStart(2, "0")}:${String(vm).padStart(2, "0")}:00`);
      const hoursUntil = (visitDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // 24-hour reminder: between 23-25 hours away
      if (!visit.reminder_24h_sent && hoursUntil > 0 && hoursUntil <= 25 && hoursUntil >= 1.5) {
        try {
          // Send email if visitor has email
          if (resend && visit.visitor_email) {
            await resend.emails.send({
              from: "Property Visits <onboarding@resend.dev>",
              to: [visit.visitor_email],
              subject: "Reminder: Property Visit Tomorrow",
              html: buildEmailHtml(visit, "24h"),
            });
          }

          // Create in-app notification
          await supabase.from("user_notifications").insert({
            user_id: visit.visitor_id,
            title: "Visit Tomorrow",
            message: `Your property visit is scheduled for tomorrow at ${visit.start_time.slice(0, 5)}.`,
            type: "visit_reminder",
            action_url: "/dashboard",
          });

          await supabase
            .from("property_visits")
            .update({ reminder_24h_sent: true })
            .eq("id", visit.id);

          results.sent_24h++;
          results.in_app++;
        } catch (e) {
          console.error(`Error sending 24h reminder for visit ${visit.id}:`, e);
          results.errors++;
        }
      }

      // 1-hour reminder: between 0-1.5 hours away
      if (!visit.reminder_1h_sent && hoursUntil > 0 && hoursUntil <= 1.5) {
        try {
          if (resend && visit.visitor_email) {
            await resend.emails.send({
              from: "Property Visits <onboarding@resend.dev>",
              to: [visit.visitor_email],
              subject: "Reminder: Property Visit in 1 Hour",
              html: buildEmailHtml(visit, "1h"),
            });
          }

          await supabase.from("user_notifications").insert({
            user_id: visit.visitor_id,
            title: "Visit Starting Soon",
            message: `Your property visit starts in about 1 hour at ${visit.start_time.slice(0, 5)}. Get ready!`,
            type: "visit_reminder",
            action_url: "/dashboard",
          });

          await supabase
            .from("property_visits")
            .update({ reminder_1h_sent: true })
            .eq("id", visit.id);

          results.sent_1h++;
          results.in_app++;
        } catch (e) {
          console.error(`Error sending 1h reminder for visit ${visit.id}:`, e);
          results.errors++;
        }
      }
    }

    console.log("Reminder results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Visit reminder error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

function buildEmailHtml(visit: any, type: "24h" | "1h"): string {
  const timeStr = visit.start_time.slice(0, 5);
  const heading = type === "24h" ? "Your Visit is Tomorrow" : "Your Visit is in 1 Hour";
  const subtitle = type === "24h"
    ? `Your property visit is scheduled for <strong>${visit.visit_date}</strong> at <strong>${timeStr}</strong>.`
    : `Your property visit starts at <strong>${timeStr}</strong> today. Get ready!`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="background:#f8f9fa;border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:24px;">
      <div style="width:48px;height:48px;background:#6366f1;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="color:white;font-size:24px;">📅</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">${heading}</h1>
      <p style="margin:0;font-size:14px;color:#6b7280;">${subtitle}</p>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
      <table style="width:100%;font-size:14px;color:#374151;">
        <tr><td style="padding:6px 0;color:#9ca3af;">Date</td><td style="padding:6px 0;text-align:right;font-weight:600;">${visit.visit_date}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Time</td><td style="padding:6px 0;text-align:right;font-weight:600;">${timeStr} – ${visit.end_time.slice(0, 5)}</td></tr>
        <tr><td style="padding:6px 0;color:#9ca3af;">Status</td><td style="padding:6px 0;text-align:right;font-weight:600;color:${visit.status === "confirmed" ? "#16a34a" : "#d97706"};">${visit.status === "confirmed" ? "Confirmed" : "Pending"}</td></tr>
        ${visit.notes ? `<tr><td style="padding:6px 0;color:#9ca3af;">Notes</td><td style="padding:6px 0;text-align:right;">${visit.notes}</td></tr>` : ""}
      </table>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;">
      This is an automated reminder from Astra Villa Realty.
    </p>
  </div>
</body>
</html>`;
}
