// Notifies admin when a new lead is submitted from the public site.
// Public endpoint (no auth required) — the leads table RLS allows anonymous INSERT.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "astravillarealty@gmail.com";
const FROM_EMAIL = "notify@astravilla.com";
const SITE_NAME = "ASTRA Villa";

interface LeadInput {
  name: string;
  email: string;
  phone?: string | null;
  message?: string;
  property_id?: string | null;
  source?: "website" | "whatsapp" | "contact";
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: LeadInput = await req.json();

    // Validation
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    if (!name || name.length > 200) throw new Error("Invalid name");
    if (!email || !isValidEmail(email) || email.length > 200) throw new Error("Invalid email");
    const phone = body.phone?.toString().trim().slice(0, 30) || null;
    const message = (body.message ?? "").toString().slice(0, 2000);
    const source = ["website", "whatsapp", "contact"].includes(body.source ?? "")
      ? body.source : "website";
    const property_id = body.property_id || null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Insert lead
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({ name, email, phone, message, source, property_id })
      .select("id, property_id")
      .single();

    if (error) throw error;

    // Look up property title for the email (optional)
    let propertyTitle: string | null = null;
    if (lead.property_id) {
      const { data: p } = await supabase
        .from("properties")
        .select("title, slug")
        .eq("id", lead.property_id)
        .maybeSingle();
      propertyTitle = p?.title ?? null;
    }

    // Send email via Resend (best-effort — lead is already saved)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const subject = propertyTitle
        ? `New lead: ${name} — "${propertyTitle}"`
        : `New lead: ${name}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff">
          <h2 style="font-family:Georgia,serif;color:#0B0B0B;margin:0 0 16px">New inquiry on ${SITE_NAME}</h2>
          <p style="color:#444;line-height:1.6;margin:0 0 16px">A new lead just came in${propertyTitle ? ` for <strong>${propertyTitle}</strong>` : ""}.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#222">
            <tr><td style="padding:6px 0;color:#777;width:100px">Name</td><td>${escape(name)}</td></tr>
            <tr><td style="padding:6px 0;color:#777">Email</td><td><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding:6px 0;color:#777">Phone</td><td>${escape(phone)}</td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#777">Source</td><td>${escape(source!)}</td></tr>
            ${propertyTitle ? `<tr><td style="padding:6px 0;color:#777">Property</td><td>${escape(propertyTitle)}</td></tr>` : ""}
          </table>
          ${message ? `<div style="margin-top:16px;padding:14px;background:#f5f3ee;border-left:3px solid #C8A96A;color:#222;white-space:pre-line;border-radius:6px">${escape(message)}</div>` : ""}
          <p style="color:#999;font-size:12px;margin-top:24px">Manage leads at https://astravilla.com/admin/leads</p>
        </div>
      `;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `${SITE_NAME} <${FROM_EMAIL}>`,
            to: [ADMIN_EMAIL],
            reply_to: email,
            subject,
            html,
          }),
        });
      } catch (err) {
        console.error("Email send failed:", err);
      }
    }

    return new Response(JSON.stringify({ ok: true, id: lead.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-lead error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
