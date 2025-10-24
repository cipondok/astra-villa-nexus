import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import DOMPurify from "npm:dompurify@3.0.6";
import { JSDOM } from "npm:jsdom@23.0.1";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const validated = emailSchema.parse(rawData);
    
    const { customer_email, customer_name, inquiry_type, message } = validated;
    
    // Setup DOMPurify with JSDOM
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    
    // Sanitize all user inputs
    const safeName = purify.sanitize(customer_name);
    const safeMessage = message ? purify.sanitize(message) : '';

    if (!customer_email || !customer_name) {
      return new Response(
        JSON.stringify({ error: "Missing customer_email or customer_name" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = `We received your ${inquiry_type}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Thank you, ${safeName}!</h2>
        <p>We have received your message and our team will get back to you shortly.</p>
        ${safeMessage ? `<p style="white-space: pre-wrap;"><strong>Your message:</strong><br/>${safeMessage}</p>` : ''}
        <p style="margin-top: 16px;">Best regards,<br/>Astra Villa Team</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Astra Villa <onboarding@resend.dev>",
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
    
    // Handle validation errors
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
