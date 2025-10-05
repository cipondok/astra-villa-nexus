import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InquiryEmailRequest {
  inquiry_id?: string;
  customer_email: string;
  customer_name: string;
  inquiry_type?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_email, customer_name, inquiry_type = 'inquiry', message = '' }: InquiryEmailRequest = await req.json();

    if (!customer_email || !customer_name) {
      return new Response(
        JSON.stringify({ error: "Missing customer_email or customer_name" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = `We received your ${inquiry_type}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Thank you, ${customer_name}!</h2>
        <p>We have received your message and our team will get back to you shortly.</p>
        ${message ? `<p style="white-space: pre-wrap;"><strong>Your message:</strong><br/>${message}</p>` : ''}
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
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
