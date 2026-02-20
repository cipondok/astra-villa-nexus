import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const emailSchema = z.object({
  inquiry_id: z.string().uuid().optional(),
  customer_email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  customer_name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  inquiry_type: z.string().trim().max(50).optional().default('inquiry'),
  message: z.string().max(5000).optional().default('')
});

// Simple HTML sanitizer — strips all tags without needing jsdom/DOMPurify
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const validated = emailSchema.parse(rawData);
    
    const { customer_email, customer_name, inquiry_type, message } = validated;
    
    // Sanitize all user inputs
    const safeName = sanitizeText(customer_name);
    const safeMessage = message ? sanitizeText(message) : '';

    const subject = `We received your ${sanitizeText(inquiry_type || 'inquiry')}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;">
        <div style="border-top: 4px solid #B8860B; padding-top: 24px;">
          <h2 style="color: #2D2A26; font-size: 22px; margin: 0 0 16px 0;">Terima kasih, ${safeName}!</h2>
          <p style="color: #4A4540; font-size: 15px;">Kami telah menerima pesan Anda dan tim kami akan segera menghubungi Anda.</p>
          ${safeMessage ? `<div style="background: #FFFBF5; border-left: 3px solid #B8860B; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #6B635A; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pesan Anda:</p>
            <p style="margin: 8px 0 0 0; color: #4A4540; font-size: 14px; white-space: pre-wrap;">${safeMessage}</p>
          </div>` : ''}
          <p style="color: #4A4540; font-size: 15px; margin-top: 24px;">Salam hormat,<br/><strong style="color: #B8860B;">Tim ASTRA Villa Realty</strong></p>
        </div>
        <div style="border-top: 1px solid #E8E0D5; margin-top: 32px; padding-top: 16px; text-align: center;">
          <p style="color: #A8A29E; font-size: 11px; margin: 0;">© 2024 ASTRA Villa Realty • Jakarta, Indonesia</p>
        </div>
      </div>
    `;

    // Use verified domain sender in production; fall back to Resend sandbox for dev
    const fromAddress = Deno.env.get("EMAIL_FROM_ADDRESS") || "ASTRA Villa <onboarding@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [customer_email],
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-inquiry-email:", error);
    
    if (error.name === 'ZodError') {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
